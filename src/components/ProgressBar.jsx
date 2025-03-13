import React, { useEffect, useState } from "react";
import { View, Text, Animated } from "react-native";

const ProgressBar = () => {
  const [progress, setProgress] = useState(0);
  const progressAnim = new Animated.Value(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 3000;

    const animate = () => {
      const elapsed = Date.now() - start;
      const percentage = Math.min((elapsed / duration) * 100, 100);

      setProgress(percentage);
      progressAnim.setValue(percentage);

      if (percentage < 75) {
        requestAnimationFrame(animate);
      }
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <View className="absolute ">
      <View className="w-[250px] py-2 relative">
        <View className="flex flex-row justify-between absolute top-[-10px] w-full">
          <Text className="text-[12px] font-medium">Frequência</Text>
          <Text className="text-[12px] font-medium">{Math.round(progress)}/100</Text>
        </View>

        <View className="w-full h-[4px] bg-[#E0E0E0] rounded-full overflow-hidden">
          <Animated.View
            className="h-full bg-black rounded-full"
            style={{
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default ProgressBar;