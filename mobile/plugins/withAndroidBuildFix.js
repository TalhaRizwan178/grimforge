const { withGradleProperties } = require('expo/config-plugins');

/** Persist AsyncStorage + Kotlin settings across `expo prebuild`. */
function withAndroidBuildFix(config) {
  return withGradleProperties(config, (mod) => {
    const add = (key, value) => {
      const existing = mod.modResults.find((item) => item.type === 'property' && item.key === key);
      if (existing) {
        existing.value = value;
      } else {
        mod.modResults.push({ type: 'property', key, value });
      }
    };

    add('AsyncStorage_kotlinVersion', '2.1.20');
    add('AsyncStorage_next_kspVersion', '2.1.20-2.0.1');
    add('org.gradle.daemon', 'true');
    add('org.gradle.caching', 'true');

    return mod;
  });
}

module.exports = withAndroidBuildFix;
