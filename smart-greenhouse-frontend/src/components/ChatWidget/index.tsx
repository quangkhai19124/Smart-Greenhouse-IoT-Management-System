import { Tooltip } from "antd";
import React from "react";

const ChatWidget: React.FC = () => {

  return (
    <div className="fixed right-5 bottom-5 z-[9999] font-inherit">
      <Tooltip title="Chat with Telegram Bot">
        <a 
          href="https://t.me/smartgreenhouse_bk_bot" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          <img src="/tele.png" alt="Telegram" className="w-12 h-12" />
        </a>
      </Tooltip>
    </div>
  );
};

export default ChatWidget;
