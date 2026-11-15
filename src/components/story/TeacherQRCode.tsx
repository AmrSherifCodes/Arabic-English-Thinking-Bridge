import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  url: string;
  size?: number;
}

export const TeacherQRCode: React.FC<Props> = ({ url, size = 280 }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-2xl inline-block">
      <QRCodeSVG value={url} size={size} level="M" includeMargin />
      <div className="mt-2 text-center text-xs font-mono text-stone-600 break-all max-w-[280px]">
        {url}
      </div>
    </div>
  );
};
