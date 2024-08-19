import { useEffect, useState } from "react";
const useWindowSize = () => {
  const getWindowDimensions = () => {
    const { innerHeight: windowHeight, innerWidth: windowWidth } = window;
    return {
      windowHeight,
      windowWidth,
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
