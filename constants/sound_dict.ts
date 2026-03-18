export const SOUND_DICTIONARY: Record<
  string,
  { id: string; name: string; file: any }[]
> = {
  PRESENT: [
    {
      id: "p_1",
      name: "Chime",
      file: require("../assets/sounds/present/one.mp3"),
    },
    {
      id: "p_2",
      name: "Pop",
      file: require("../assets/sounds/present/two.mp3"),
    },
    {
      id: "p_3",
      name: "Ding",
      file: require("../assets/sounds/present/three.mp3"),
    },
    {
      id: "p_4",
      name: "Sparkle",
      file: require("../assets/sounds/present/four.mp3"),
    },
    {
      id: "p_5",
      name: "Twinkle",
      file: require("../assets/sounds/present/five.mp3"),
    },
    {
      id: "p_6",
      name: "Ping",
      file: require("../assets/sounds/present/six.mp3"),
    },
    {
      id: "p_7",
      name: "Clink",
      file: require("../assets/sounds/present/seven.mp3"),
    },
    {
      id: "p_8",
      name: "Ripple",
      file: require("../assets/sounds/present/eight.mp3"),
    },
    {
      id: "p_9",
      name: "Glow",
      file: require("../assets/sounds/present/nine.mp3"),
    },
    {
      id: "p_10",
      name: "Bloom",
      file: require("../assets/sounds/present/ten.mp3"),
    }
  ],
  ABSENT: [
    {
      id: "a_1",
      name: "Buzzer",
      file: require("../assets/sounds/absent/one.mp3"),
    },
    {
      id: "a_2",
      name: "Click",
      file: require("../assets/sounds/absent/two.mp3"),
    },
    {
      id: "a_3",
      name: "Thud",
      file: require("../assets/sounds/absent/three.mp3"),
    },
    {
      id: "a_4",
      name: "Drop",
      file: require("../assets/sounds/absent/four.mp3"),
    },
    {
      id: "a_5",
      name: "Clunk",
      file: require("../assets/sounds/absent/five.mp3"),
    },
    {
      id: "a_6",
      name: "Snap",
      file: require("../assets/sounds/absent/six.mp3"),
    },
    {
      id: "a_7",
      name: "Rustle",
      file: require("../assets/sounds/absent/seven.mp3"),
    },
    {
      id: "a_8",
      name: "Slam",
      file: require("../assets/sounds/absent/eight.mp3"),
    },
  ],
  MEDICAL: [
    {
      id: "m_1",
      name: "Bell",
      file: require("../assets/sounds/medical/one.mp3"),
    },
    {
      id: "m_2",
      name: "Soft",
      file: require("../assets/sounds/medical/two.mp3"),
    },
    {
      id: "m_3",
      name: "Gentle",
      file: require("../assets/sounds/medical/three.mp3"),
    },
    {
      id: "m_4",
      name: "Calm",
      file: require("../assets/sounds/medical/four.mp3"),
    },
    {
      id: "m_5",
      name: "Mellow",
      file: require("../assets/sounds/medical/five.mp3"),
    },
    {
      id: "m_6",
      name: "Serene",
      file: require("../assets/sounds/medical/six.mp3"),
    },
    {
      id: "m_7",
      name: "Tranquil",
      file: require("../assets/sounds/medical/seven.mp3"),
    }
  ],
  CANCELLED: [
    {
      id: "c_1",
      name: "Sweep",
      file: require("../assets/sounds/cancelled/one.mp3"),
    },
    {
      id: "c_2",
      name: "Drop",
      file: require("../assets/sounds/cancelled/two.mp3"),
    },
    {
      id: "c_3",
      name: "Fade",
      file: require("../assets/sounds/cancelled/three.mp3"),
    },
    {
      id: "c_4",
      name: "Dull",
      file: require("../assets/sounds/cancelled/four.mp3"),
    },
    {
      id: "c_5",
      name: "Dim",
      file: require("../assets/sounds/cancelled/five.mp3"),
    },
    {
      id: "c_6",
      name: "Quiet",
      file: require("../assets/sounds/cancelled/six.mp3"),
    }
  ],
};