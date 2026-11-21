import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { navigate as rootNavigate } from '../navigation/navigationRef';
import * as DocumentPicker from 'expo-document-picker';
import Header from '../components/common/Header';
import { useAuth } from '../context/AuthContext';
import {
  getOrCreateConsultationThread,
  listenToThreadMessages,
  sendUserConsultationMessage,
  uploadAttachmentFile,
  recordAIEvaluationMessage,
  clearConsultationMessages,
  getCachedConsultationData,
  setCachedConsultationData,
} from '../services/consultationService';
import { analyzeConsultationWithAI } from '../services/geminiService';

/**
 * WhatsApp-style date divider helper
 * Returns "Today", "Yesterday", or formatted date e.g. "18 Sep 2026"
 */
export const getDateStringForDivider = (timestamp) => {
  if (!timestamp) return 'Today';
  let date;
  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else if (typeof timestamp === 'number' || typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    return 'Today';
  }

  if (isNaN(date.getTime())) return 'Today';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const timeDiff = today.getTime() - target.getTime();
  const dayDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));

  if (dayDiff === 0) {
    return 'Today';
  } else if (dayDiff === 1) {
    return 'Yesterday';
  } else {
    return target.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
};

/**
 * WhatsApp-style message timestamp (e.g. "09:41 AM")
 */
export const formatMessageTime = (timestamp) => {
  if (!timestamp) return 'Just now';
  let date;
  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else if (typeof timestamp === 'number' || typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    return 'Just now';
  }
  if (isNaN(date.getTime())) return 'Just now';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function ChatScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { currentUser, openAuthModal } = useAuth();

  const [activeTab, setActiveTab] = useState('ai'); // 'ai' | 'therapist'
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);

  // Firestore thread & messages state
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [localAiQueue, setLocalAiQueue] = useState([]);
  const [loadingThread, setLoadingThread] = useState(true);

  // Photo viewer modal
  const [previewImage, setPreviewImage] = useState(null);

  const scrollViewRef = useRef();
  const isSendingRef = useRef(false);

  // 1. Initialize Thread & Real-time Messages from Firestore
  useEffect(() => {
    if (!currentUser) {
      setThread(null);
      setMessages([]);
      setLoadingThread(false);
      return;
    }

    let unsubscribe = () => {};

    const initConsultation = async () => {
      setLoadingThread(true);
      try {
        // Check cache first for instant rendering
        const cached = await getCachedConsultationData(currentUser.uid);
        if (cached?.thread) {
          setThread(cached.thread);
          if (cached.messages?.length > 0) {
            setMessages(cached.messages);
          }
          setLoadingThread(false);
        }

        // Get or create Firestore thread
        const activeThread = await getOrCreateConsultationThread(currentUser, {
          specialty: 'Child Rehabilitation & Therapy',
        });
        setThread(activeThread);

        if (activeThread?.id) {
          unsubscribe = listenToThreadMessages(activeThread.id, (msgs) => {
            setMessages(msgs);
            setCachedConsultationData(currentUser.uid, {
              thread: activeThread,
              messages: msgs,
            });
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
          });
        }
      } catch (err) {
        console.warn('Error initializing consultation thread:', err);
      } finally {
        setLoadingThread(false);
      }
    };

    initConsultation();

    return () => unsubscribe();
  }, [currentUser]);

  // Derive AI Messages (User queries + AI answers)
  const aiColumnMessages = useMemo(() => {
    const firestoreItems = messages.filter(
      (m) => m.sender === 'user' || m.sender === 'ai'
    );
    const combined = [...firestoreItems];
    localAiQueue.forEach((local) => {
      const exists = combined.some((m) => m.id === local.id || (m.text && m.text === local.text));
      if (!exists) {
        combined.push(local);
      }
    });

    return combined.sort((a, b) => {
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
      return timeA - timeB;
    });
  }, [messages, localAiQueue]);

  // Derive Human Therapist Messages (User queries + Therapist replies)
  const therapistThreadMessages = useMemo(() => {
    return messages
      .filter((m) => m.channel !== 'ai' && (m.sender === 'user' || m.sender === 'therapist'))
      .sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
        return timeA - timeB;
      });
  }, [messages]);

  const hasTherapistReplied = therapistThreadMessages.some((m) => m.sender === 'therapist');

  // WhatsApp Read Receipt check (2 Grey Ticks = Delivered, 2 Blue/Cyan Ticks = Seen / Replied)
  const isMessageSeenOrReplied = (msg) => {
    if (thread?.status === 'replied') return true;
    if (msg.readByAdmin || msg.status === 'read') return true;

    const msgTime = msg.createdAt?.toDate ? msg.createdAt.toDate().getTime() : new Date(msg.createdAt || 0).getTime();
    const hasLaterTherapistMsg = therapistThreadMessages.some((m) => {
      if (m.sender !== 'therapist') return false;
      const tTime = m.createdAt?.toDate ? m.createdAt.toDate().getTime() : new Date(m.createdAt || 0).getTime();
      return tTime >= msgTime;
    });

    return hasLaterTherapistMsg;
  };

  // Scroll to bottom on tab change
  useEffect(() => {
    const t = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 100);
    return () => clearTimeout(t);
  }, [activeTab]);

  // Keyboard scroll listener
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const sub = Keyboard.addListener(showEvent, () => {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => sub.remove();
  }, []);

  // Handle Send Consultation Message
  const handleSendMessage = async (customText = null) => {
    const text = (customText || inputText).trim();
    if (!text && attachments.length === 0) return;
    if (isSendingRef.current) return;

    if (!currentUser) {
      openAuthModal('login');
      return;
    }

    isSendingRef.current = true;
    setSending(true);

    const activeAttachments = [...attachments];
    setAttachments([]);
    setInputText('');

    const tempId = `local-user-${Date.now()}`;
    const userQueryItem = {
      id: tempId,
      sender: 'user',
      senderName: currentUser.displayName || 'Parent',
      text: text,
      attachments: activeAttachments,
      createdAt: new Date(),
    };

    setLocalAiQueue((prev) => [...prev, userQueryItem]);
    setAiThinking(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // 1. Trigger Gemini Clinical AI Analysis
    analyzeConsultationWithAI({
      text,
      attachments: activeAttachments,
      childSpecialty: 'Pediatric Rehabilitation & Therapy',
      chatHistory: aiColumnMessages.slice(-6),
    })
      .then(async (aiResult) => {
        const aiReplyItem = {
          id: `local-ai-${Date.now() + 1}`,
          sender: 'ai',
          text: aiResult.text,
          createdAt: new Date(),
          isFallback: aiResult.isFallback,
        };
        setLocalAiQueue((prev) => [...prev, aiReplyItem]);

        if (thread?.id) {
          await recordAIEvaluationMessage({
            threadId: thread.id,
            text: aiResult.text,
          });
          setLocalAiQueue((prev) => prev.filter((item) => item.id !== aiReplyItem.id));
        }
      })
      .catch((err) => {
        console.warn('AI analysis error:', err);
      })
      .finally(() => {
        setAiThinking(false);
      });

    // 2. Queue message in Firestore for Certified Human Therapist
    try {
      const uploadedAttachments = await Promise.all(
        activeAttachments.map(async (att) => {
          let uploadRes = { url: att.url || '', fileId: null };
          if (att.base64) {
            uploadRes = await uploadAttachmentFile(
              att.base64.startsWith('data:') ? att.base64 : `data:image/jpeg;base64,${att.base64}`,
              att.name || 'attachment.jpg',
              currentUser.uid
            );
          }
          return {
            type: att.type || 'image',
            name: att.name || 'Attachment',
            url: uploadRes.url || att.url || '',
            fileId: uploadRes.fileId || null,
          };
        })
      );

      if (thread?.id) {
        await sendUserConsultationMessage({
          threadId: thread.id,
          user: currentUser,
          text,
          attachments: uploadedAttachments,
        });
        setLocalAiQueue((prev) => prev.filter((item) => item.id !== tempId));
      }
    } catch (err) {
      console.warn('Failed to send consultation message to therapist:', err);
    } finally {
      isSendingRef.current = false;
      setSending(false);
    }
  };

  // Attachment Handler: Camera, Photo Gallery, PDF Report
  const handleAttachOptions = () => {
    Alert.alert(
      '📎 Attach Document / फ़ाइल जोड़ें',
      "Choose an option to upload Doctor's prescription, report, or photo:",
      [
        {
          text: '📷 Take Photo (Camera)',
          onPress: handleTakePhoto,
        },
        {
          text: '🖼 Photo Gallery (Parchi / Images)',
          onPress: handlePickImage,
        },
        {
          text: '📄 Upload Medical Report (PDF)',
          onPress: handlePickDocument,
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Needed', 'Camera permission is required to take photos of prescriptions or clinical progress.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setAttachments((prev) => [
          ...prev,
          {
            type: 'image',
            name: `Camera_Photo_${Date.now()}.jpg`,
            url: asset.uri,
            base64: asset.base64,
          },
        ]);
      }
    } catch (err) {
      console.warn('Take photo error:', err);
    }
  };

  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Needed', 'Gallery permission is required to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setAttachments((prev) => [
          ...prev,
          {
            type: 'image',
            name: asset.fileName || `Prescription_${Date.now()}.jpg`,
            url: asset.uri,
            base64: asset.base64,
          },
        ]);
      }
    } catch (err) {
      console.warn('Pick image error:', err);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setAttachments((prev) => [
          ...prev,
          {
            type: asset.mimeType?.includes('pdf') ? 'pdf' : 'image',
            name: asset.name || 'Medical_Assessment_Report.pdf',
            url: asset.uri,
          },
        ]);
      }
    } catch (err) {
      console.warn('Pick document error:', err);
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear Chat History Confirmation
  const handleClearChatPress = () => {
    Alert.alert(
      '🗑 Clear Chat History',
      'Are you sure you want to permanently clear all consultation messages? This will delete previous queries and replies.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            if (thread?.id) {
              try {
                await clearConsultationMessages(thread.id);
                setMessages([]);
                setLocalAiQueue([]);
                Alert.alert('✅ Cleared', 'Consultation history has been cleared.');
              } catch (e) {
                Alert.alert('Error', 'Could not clear chat. Please try again.');
              }
            }
          },
        },
      ]
    );
  };

  // ==========================================
  // 1. GUEST VIEW (Strictly matching website)
  // ==========================================
  if (!currentUser) {
    return (
      <View className="flex-1 bg-[#F8FAFC]">
        <Header showBack={false} />

        <View className="flex-1 items-center justify-center px-6 pb-12">
          <View className="w-full max-w-sm bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 items-center text-center shadow-lg">
            {/* Stethoscope Gradient Icon matching website */}
            <View className="w-16 h-16 rounded-2xl bg-[#081736] items-center justify-center mb-4 shadow-md border border-slate-700">
              <FontAwesome5 name="stethoscope" size={28} color="#5edff4" />
            </View>

            <Text className="text-[22px] font-black text-[#0F1B3D] mb-1.5 text-center">
              Chat with <Text className="text-[#E6007E]">Rehablito Experts</Text>
            </Text>

            <Text className="text-slate-500 text-[12px] text-center mb-6 leading-[18px]">
              Connect directly with certified therapists and our AI therapy assistant. Send text, voice notes, photos, and PDF reports.
            </Text>

            <TouchableOpacity
              onPress={() => openAuthModal('login')}
              activeOpacity={0.85}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#071838] shadow-md flex-row items-center justify-center"
            >
              <Feather name="user" size={16} color="#5edff4" style={{ marginRight: 8 }} />
              <Text className="text-white font-extrabold text-[13px]">
                Login to Start Consultation
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Top Header */}
      <Header
        showBack={false}
        onSearchPress={() => {
          if (navigation?.navigate) navigation.navigate('Courses');
          else rootNavigate('Courses');
        }}
        onNotificationPress={() => {
          if (navigation?.getParent) {
            const parent = navigation.getParent();
            if (parent?.navigate) return parent.navigate('NotificationSettings');
          }
          if (navigation?.navigate) {
            navigation.navigate('NotificationSettings');
          } else {
            rootNavigate('NotificationSettings');
          }
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        className="flex-1"
      >
        {/* ================= 1. CONSULTATION HUB INFO CARD ================= */}
        <View className="mx-3.5 mt-2 mb-1.5 bg-white border border-slate-200/90 rounded-2xl p-3 shadow-sm flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 mr-2">
            <View className="w-9 h-9 rounded-xl bg-[#FCE7F3] border border-[#fbcfe8] items-center justify-center mr-2.5">
              <MaterialCommunityIcons name="brain" size={20} color="#E6007E" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-[13px] font-black text-[#0F1B3D] mr-1.5">
                  Consultation Hub
                </Text>
                <View className="px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                  <Text className="text-emerald-600 text-[8.5px] font-black uppercase">
                    LIVE
                  </Text>
                </View>
              </View>
              <Text className="text-slate-500 text-[10.5px]" numberOfLines={1}>
                Dual Stream: Instant AI & Certified Therapist
              </Text>
            </View>
          </View>

          {/* Action: Clear Chat Button */}
          <TouchableOpacity
            onPress={handleClearChatPress}
            activeOpacity={0.7}
            className="flex-row items-center px-2.5 py-1.5 rounded-xl border border-red-200 bg-red-50/80"
          >
            <Feather name="trash-2" size={12} color="#dc2626" style={{ marginRight: 4 }} />
            <Text className="text-red-700 text-[10.5px] font-bold">Clear</Text>
          </TouchableOpacity>
        </View>

        {/* ================= 2. DUAL CHANNEL TABS (AI / THERAPIST) ================= */}
        <View className="mx-3.5 mb-2 flex-row items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          {/* Tab 1: AI Evaluation */}
          <TouchableOpacity
            onPress={() => setActiveTab('ai')}
            activeOpacity={0.8}
            className={`flex-1 py-2 rounded-xl flex-row items-center justify-center ${
              activeTab === 'ai' ? 'bg-[#E6007E] shadow-sm' : 'bg-transparent'
            }`}
          >
            <MaterialCommunityIcons
              name="robot-excited-outline"
              size={16}
              color={activeTab === 'ai' ? '#ffffff' : '#64748b'}
              style={{ marginRight: 5 }}
            />
            <Text
              className={`text-[11.5px] font-black ${
                activeTab === 'ai' ? 'text-white' : 'text-slate-600'
              }`}
            >
              AI Evaluation
            </Text>
            {aiThinking && (
              <View className="w-2 h-2 rounded-full bg-white ml-1.5 animate-ping" />
            )}
          </TouchableOpacity>

          {/* Tab 2: Certified Therapist */}
          <TouchableOpacity
            onPress={() => setActiveTab('therapist')}
            activeOpacity={0.8}
            className={`flex-1 py-2 rounded-xl flex-row items-center justify-center ${
              activeTab === 'therapist' ? 'bg-[#071838] shadow-sm' : 'bg-transparent'
            }`}
          >
            <FontAwesome5
              name="stethoscope"
              size={13}
              color={activeTab === 'therapist' ? '#ffffff' : '#64748b'}
              style={{ marginRight: 5 }}
            />
            <Text
              className={`text-[11.5px] font-black ${
                activeTab === 'therapist' ? 'text-white' : 'text-slate-600'
              }`}
            >
              Certified Therapist
            </Text>
            {hasTherapistReplied && (
              <View className="w-2 h-2 rounded-full bg-emerald-400 ml-1.5" />
            )}
          </TouchableOpacity>
        </View>

        {/* ================= 3. MESSAGE STREAMS ================= */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-3.5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          {/* ================= TAB 1: AI STREAM ================= */}
          {activeTab === 'ai' && (
            <>
              {aiColumnMessages.length === 0 ? (
                <View className="my-8 items-center justify-center p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
                  <View className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 items-center justify-center mb-3">
                    <Ionicons name="sparkles" size={24} color="#E6007E" />
                  </View>
                  <Text className="text-[#0F1B3D] text-[14px] font-black mb-1 text-center">
                    Instant Clinical Evaluation
                  </Text>
                  <Text className="text-slate-500 text-[11.5px] text-center mb-4 leading-[17px] px-2">
                    Send child symptoms, developmental doubts, or upload doctor reports. AI responds immediately in Hindi/English.
                  </Text>
                  <TouchableOpacity
                    onPress={handleAttachOptions}
                    activeOpacity={0.8}
                    className="flex-row items-center px-4 py-2.5 rounded-xl bg-pink-50 border border-pink-200 shadow-sm"
                  >
                    <Feather name="paperclip" size={14} color="#E6007E" style={{ marginRight: 6 }} />
                    <Text className="text-[#E6007E] text-[11px] font-bold">
                      Choose Document / पर्ची व रिपोर्ट अपलोड करें
                    </Text>
                  </TouchableOpacity>
                  <Text className="text-slate-400 text-[10px] font-medium mt-2 text-center">
                    Supports: Doctor's Prescription (Parchi), Assessment PDF, Photos
                  </Text>
                </View>
              ) : (
                aiColumnMessages.map((item, index) => {
                  const currentDateStr = getDateStringForDivider(item.createdAt);
                  const prevItem = aiColumnMessages[index - 1];
                  const prevDateStr = prevItem ? getDateStringForDivider(prevItem.createdAt) : null;
                  const showDateDivider = currentDateStr !== prevDateStr;

                  const isUser = item.sender === 'user';

                  return (
                    <React.Fragment key={item.id || index}>
                      {/* WhatsApp Date Divider */}
                      {showDateDivider && (
                        <View className="items-center my-2.5">
                          <View className="px-3 py-1 rounded-full bg-slate-200/90 border border-slate-300/60 shadow-sm">
                            <Text className="text-slate-700 text-[9.5px] font-black uppercase tracking-wider">
                              {currentDateStr}
                            </Text>
                          </View>
                        </View>
                      )}

                      <View
                        className={`mb-2.5 flex-row ${
                          isUser ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <View
                          style={isUser ? styles.userBubble : styles.aiBubble}
                          className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                            isUser
                              ? 'bg-[#071838] border border-slate-800'
                              : 'bg-white border border-slate-200/90'
                          }`}
                        >
                          {!isUser && (
                            <View className="flex-row items-center mb-1 pb-1 border-b border-pink-100">
                              <MaterialCommunityIcons name="robot" size={13} color="#E6007E" style={{ marginRight: 4 }} />
                              <Text className="text-[#E6007E] text-[10.5px] font-black">
                                Rehablito AI Evaluation:
                              </Text>
                            </View>
                          )}

                          <Text
                            className={`text-[12.5px] leading-[18px] ${
                              isUser ? 'text-white' : 'text-slate-800 font-medium'
                            }`}
                          >
                            {item.text}
                          </Text>

                          {/* Attachments rendering */}
                          {item.attachments && item.attachments.length > 0 && (
                            <View className="mt-2 pt-1.5 border-t border-slate-200/40">
                              {item.attachments.map((att, aIdx) => (
                                <View key={aIdx} className="mt-1">
                                  {att.type === 'image' && (
                                    <TouchableOpacity
                                      activeOpacity={0.85}
                                      onPress={() => setPreviewImage(att.url)}
                                      className="rounded-xl overflow-hidden border border-slate-200 max-w-[200px]"
                                    >
                                      <Image
                                        source={{ uri: att.url }}
                                        className="w-48 h-32"
                                        resizeMode="cover"
                                      />
                                    </TouchableOpacity>
                                  )}
                                  {att.type === 'pdf' && (
                                    <View className="flex-row items-center p-2 rounded-xl bg-slate-100 border border-slate-200">
                                      <Feather name="file-text" size={16} color="#E6007E" style={{ marginRight: 6 }} />
                                      <Text numberOfLines={1} className="text-[11px] font-bold text-slate-800 flex-1">
                                        {att.name}
                                      </Text>
                                      <Text className="text-[9px] font-black text-slate-400 ml-1">PDF</Text>
                                    </View>
                                  )}
                                </View>
                              ))}
                            </View>
                          )}

                          {/* WhatsApp Timestamp & Cyan Checks */}
                          <View className="flex-row items-center justify-end mt-1.5">
                            <Text
                              className={`text-[9.5px] mr-1 ${
                                isUser ? 'text-slate-400' : 'text-slate-400'
                              }`}
                            >
                              {formatMessageTime(item.createdAt)}
                            </Text>
                            {isUser && (
                              <Ionicons name="checkmark-done" size={13} color="#5edff4" />
                            )}
                          </View>
                        </View>
                      </View>
                    </React.Fragment>
                  );
                })
              )}

              {/* In-Flight AI Thinking indicator */}
              {aiThinking && (
                <View className="self-start flex-row items-center bg-white border border-slate-200 px-3 py-2 rounded-2xl shadow-sm mb-3">
                  <ActivityIndicator size="small" color="#E6007E" style={{ marginRight: 6 }} />
                  <Text className="text-slate-600 text-[11px] font-medium animate-pulse">
                    AI is evaluating developmental parameters...
                  </Text>
                </View>
              )}
            </>
          )}

          {/* ================= TAB 2: CERTIFIED THERAPIST STREAM ================= */}
          {activeTab === 'therapist' && (
            <>
              {/* Neutral Waiting Card (Matches website 100%) */}
              {!hasTherapistReplied && (
                <View className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 mb-3 shadow-sm">
                  <View className="flex-row items-center mb-1">
                    <Feather name="clock" size={14} color="#d97706" style={{ marginRight: 5 }} />
                    <Text className="text-amber-800 text-[12px] font-black">
                      Please wait, Therapist will reply soon
                    </Text>
                  </View>
                  <Text className="text-slate-600 text-[11px] leading-[16px] mb-2">
                    Your query, case details, and attachments have been queued for our certified rehabilitation specialist on duty. You will receive an official clinical evaluation in this column shortly.
                  </Text>
                  <View className="pt-1.5 border-t border-amber-200/60 flex-row items-center justify-between">
                    <Text className="text-slate-500 text-[10px]">
                      Status: <Text className="font-bold text-amber-900">In Clinical Queue</Text>
                    </Text>
                    <Text className="text-slate-400 text-[10px] font-mono">
                      Case #{thread?.id?.slice(-6) || '0487'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Therapist Message Stream */}
              {therapistThreadMessages.map((msg, index) => {
                const currentDateStr = getDateStringForDivider(msg.createdAt);
                const prevItem = therapistThreadMessages[index - 1];
                const prevDateStr = prevItem ? getDateStringForDivider(prevItem.createdAt) : null;
                const showDateDivider = currentDateStr !== prevDateStr;

                const isUser = msg.sender === 'user';
                const isSeen = isMessageSeenOrReplied(msg);

                return (
                  <React.Fragment key={msg.id || index}>
                    {showDateDivider && (
                      <View className="items-center my-2.5">
                        <View className="px-3 py-1 rounded-full bg-slate-200/90 border border-slate-300/60 shadow-sm">
                          <Text className="text-slate-700 text-[9.5px] font-black uppercase tracking-wider">
                            {currentDateStr}
                          </Text>
                        </View>
                      </View>
                    )}

                    <View
                      className={`mb-2.5 flex-row ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <View
                        style={isUser ? styles.userBubble : styles.therapistBubble}
                        className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                          isUser
                            ? 'bg-[#071838] border border-slate-800'
                            : 'bg-[#E0F2FE] border border-[#38BDF8]/40'
                        }`}
                      >
                        {!isUser && (
                          <View className="flex-row items-center mb-1 pb-1 border-b border-sky-200">
                            <View className="w-4 h-4 rounded-full bg-sky-600 items-center justify-center mr-1.5">
                              <Text className="text-white text-[8px] font-black">DR</Text>
                            </View>
                            <Text className="text-[#0284C7] text-[11px] font-black">
                              {msg.senderName || 'Senior Clinical Specialist'}
                            </Text>
                          </View>
                        )}

                        {/* Quoted Message (When Therapist replies to specific message) */}
                        {msg.replyTo && (
                          <View className="mb-1.5 p-2 rounded-xl bg-white/70 border-l-4 border-[#0284C7]">
                            <Text className="text-[#0284C7] text-[10px] font-bold">
                              Replying to {msg.replyTo.senderName || 'Parent'}:
                            </Text>
                            <Text numberOfLines={2} className="text-slate-600 text-[10.5px] italic mt-0.5">
                              "{msg.replyTo.text || 'Attachment / query'}"
                            </Text>
                          </View>
                        )}

                        <Text
                          className={`text-[12.5px] leading-[18px] ${
                            isUser ? 'text-white' : 'text-[#0F1B3D] font-medium'
                          }`}
                        >
                          {msg.text}
                        </Text>

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <View className="mt-2 pt-1.5 border-t border-slate-200/40">
                            {msg.attachments.map((att, aIdx) => (
                              <View key={aIdx} className="mt-1">
                                {att.type === 'image' && (
                                  <TouchableOpacity
                                    activeOpacity={0.85}
                                    onPress={() => setPreviewImage(att.url)}
                                    className="rounded-xl overflow-hidden border border-slate-200 max-w-[200px]"
                                  >
                                    <Image
                                      source={{ uri: att.url }}
                                      className="w-48 h-32"
                                      resizeMode="cover"
                                    />
                                  </TouchableOpacity>
                                )}
                                {att.type === 'pdf' && (
                                  <View className="flex-row items-center p-2 rounded-xl bg-white border border-slate-200">
                                    <Feather name="file-text" size={16} color="#0284c7" style={{ marginRight: 6 }} />
                                    <Text numberOfLines={1} className="text-[11px] font-bold text-slate-800 flex-1">
                                      {att.name}
                                    </Text>
                                    <Text className="text-[9px] font-black text-slate-400 ml-1">PDF</Text>
                                  </View>
                                )}
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Timestamp & WhatsApp Ticks (2 Grey Ticks = Delivered, 2 Blue Ticks = Replied/Reviewed) */}
                        <View className="flex-row items-center justify-end mt-1.5">
                          <Text
                            className={`text-[9.5px] mr-1 ${
                              isUser ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          >
                            {formatMessageTime(msg.createdAt)}
                          </Text>
                          {isUser && (
                            <Ionicons
                              name="checkmark-done"
                              size={13}
                              color={isSeen ? '#5edff4' : '#94a3b8'}
                            />
                          )}
                        </View>
                      </View>
                    </View>
                  </React.Fragment>
                );
              })}
            </>
          )}
        </ScrollView>

        {/* ================= 4. UNIFIED MULTIMODAL INPUT BAR ================= */}
        <View className="bg-white border-t border-slate-200 px-3 py-2">
          {/* Active Attachments Preview Chips */}
          {attachments.length > 0 && (
            <View className="flex-row flex-wrap gap-1.5 pb-2 border-b border-slate-100 mb-1.5">
              {attachments.map((att, idx) => (
                <View
                  key={idx}
                  className="flex-row items-center bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl"
                >
                  <Feather
                    name={att.type === 'image' ? 'image' : 'file-text'}
                    size={12}
                    color="#0284c7"
                    style={{ marginRight: 4 }}
                  />
                  <Text numberOfLines={1} className="text-[11px] font-bold text-slate-800 max-w-[120px]">
                    {att.name}
                  </Text>
                  <TouchableOpacity onPress={() => removeAttachment(idx)} className="ml-1.5">
                    <Feather name="x" size={12} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View className="flex-row items-center">
            {/* Paperclip Button */}
            <TouchableOpacity
              onPress={handleAttachOptions}
              disabled={sending}
              activeOpacity={0.7}
              className="w-10 h-10 rounded-2xl bg-slate-100 items-center justify-center mr-2 border border-slate-200"
            >
              <Feather name="paperclip" size={18} color="#0284c7" />
            </TouchableOpacity>

            {/* Message Text Input */}
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder={
                activeTab === 'ai'
                  ? 'Ask therapy question or signs...'
                  : 'Message certified therapist on duty...'
              }
              placeholderTextColor="#94a3b8"
              multiline
              maxLength={1000}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-[13px] text-slate-900 max-h-24"
            />

            {/* Send Button */}
            <TouchableOpacity
              onPress={() => handleSendMessage()}
              disabled={sending || (!inputText.trim() && attachments.length === 0)}
              activeOpacity={0.8}
              className={`w-10 h-10 rounded-2xl items-center justify-center ml-2 shadow-sm ${
                inputText.trim() || attachments.length > 0
                  ? activeTab === 'ai'
                    ? 'bg-[#E6007E]'
                    : 'bg-[#071838]'
                  : 'bg-slate-200'
              }`}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons name="send" size={16} color="#ffffff" style={{ marginLeft: 2 }} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Image Preview Lightbox Modal */}
      {previewImage && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View className="flex-1 bg-black/90 items-center justify-center p-4">
            <TouchableOpacity
              onPress={() => setPreviewImage(null)}
              className="absolute top-12 right-4 z-20 w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            >
              <Feather name="x" size={22} color="#ffffff" />
            </TouchableOpacity>
            <Image
              source={{ uri: previewImage }}
              className="w-full h-4/5 rounded-2xl"
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  userBubble: {
    borderTopRightRadius: 4,
  },
  aiBubble: {
    borderTopLeftRadius: 4,
  },
  therapistBubble: {
    borderTopLeftRadius: 4,
  },
});
