import { useEffect, useState } from "react";
const useWindowSize = () => {
  const getWindowDimensions = () => {
    if (window) {
      const { innerHeight: windowHeight, innerWidth: windowWidth } = window;
      return {
        windowHeight,
        windowWidth,
      };
    }

    return {
      windowHeight: 0,
      windowWidth: 0,
    };
  };
  const [windowSize, setWindowSize] = useState(getWindowDimensions());

  useEffect(() => {
    const windowSizeHandler = () => {
      setWindowSize(getWindowDimensions());
    };
    window.addEventListener("resize", windowSizeHandler);

    return () => {
      window.removeEventListener("resize", windowSizeHandler);
    };
  }, []);

  return windowSize;
};

export default useWindowSize;
