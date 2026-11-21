const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'node_modules', '@react-navigation', 'core', 'lib', 'module', 'NavigationStateContext.js');

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');

  // Replace throwing getters with safe fallbacks
  const safeCode = `export const NavigationStateContext = /*#__PURE__*/React.createContext({
  isDefault: true,
  get getKey() {
    return () => undefined;
  },
  get setKey() {
    return () => {};
  },
  get getState() {
    return () => undefined;
  },
  get setState() {
    return () => {};
  },
  get getIsInitial() {
    return () => false;
  }
});`;

  if (content.includes('throw new Error(MISSING_CONTEXT_ERROR)')) {
    content = content.replace(/export const NavigationStateContext[\s\S]*?\}\);/, safeCode);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('✅ Successfully patched NavigationStateContext to prevent missing context crash.');
  }
}

// 2. Patch react-native-css-interop infinite loop in printUpgradeWarning / stringify
const interopFile = path.join(__dirname, '..', 'node_modules', 'react-native-css-interop', 'dist', 'runtime', 'native', 'render-component.js');
if (fs.existsSync(interopFile)) {
  let content = fs.readFileSync(interopFile, 'utf8');
  if (content.includes('seen.delete(value);')) {
    content = content.replace(
      /function printUpgradeWarning[\s\S]*?function getDebugReplacer/,
      `function printUpgradeWarning(warning, originalProps) {
    console.warn(\`[CssInterop] \${warning}\`);
}
function stringify(object) {
    try {
        const seen = new WeakSet();
        return JSON.stringify(object, function replace(key, value) {
            if (key === 'navigation' || key === 'route' || key === 'children' || key === '_owner') {
                return '[ReactInternal]';
            }
            if (value !== null && typeof value === "object") {
                if (seen.has(value)) {
                    return "[Circular]";
                }
                seen.add(value);
            }
            return value;
        }, 2);
    } catch (e) {
        return '[Props]';
    }
}
function getDebugReplacer`
    );
    fs.writeFileSync(interopFile, content, 'utf8');
    console.log('✅ Successfully patched react-native-css-interop to prevent Maximum Call Stack recursion.');
  }
}

