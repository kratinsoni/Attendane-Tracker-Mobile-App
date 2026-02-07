import { Text, TouchableOpacity, View } from "react-native";

interface StatusButtonProps {
  icon: React.ElementType;
  color: string;
  bg: string;
  text: string;
  textColor: string;
  onSubmit?: (status: string) => void;
}

export const StatusButton = ({
  icon: Icon,
  color,
  bg,
  text,
  textColor,
  onSubmit,
}: StatusButtonProps) => (
  <TouchableOpacity
    onPress={() => onSubmit && onSubmit(text)}
    activeOpacity={0.7}
    className={`items-center justify-center py-3 px-1 rounded-2xl w-[23%] ${bg} shadow-sm`}
    style={{ elevation: 2 }} // Added subtle shadow for Android
  >
    <View className="mb-1">
      <Icon size={20} color={color} strokeWidth={2.5} />
    </View>
    <Text className={`text-[9px] font-black tracking-tighter ${textColor}`}>
      {text}
    </Text>
  </TouchableOpacity>
);
