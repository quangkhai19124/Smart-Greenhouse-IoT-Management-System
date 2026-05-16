import React, { useEffect } from 'react';
import { Image } from "antd";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {

  useEffect(() => {
    const checkResourcesLoaded = async () => {
      try {
        const isCSSLoaded = document.readyState === 'complete';
        if (document.fonts) {
          await document.fonts.ready;
        }
        const images = document.querySelectorAll('img');
        const imagesLoaded = Array.from(images).every(img => img.complete);
        
        return isCSSLoaded && imagesLoaded;
      } catch (error) {
        console.warn('Error checking resources:', error);
        return false;
      }
    };

    const handleLoad = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const resourcesLoaded = await checkResourcesLoaded();
        
        if (resourcesLoaded) {
          setTimeout(() => {
            onFinish();
          }, 500);
        } else {
          setTimeout(() => handleLoad(), 200);
        }
      } catch {
        setTimeout(() => {
          setTimeout(() => onFinish(), 500);
        }, 1500);
      }
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[9999]">
            <div className="flex items-center justify-center h-screen">
                <Image src="/favicon.ico" alt="logo" width={90} height={90} preview={false} />
            </div>
            <div className="flex flex-col items-center justify-center text-center absolute bottom-10 left-1/2 -translate-x-1/2">
                <div className="text-md text-gray-600 dark:text-gray-400">Smart GreenHouse</div>
                <div className="pt-1 font-semibold">from Group 1 - HK251</div>
            </div>
        </div>
  );
};

export default SplashScreen;
