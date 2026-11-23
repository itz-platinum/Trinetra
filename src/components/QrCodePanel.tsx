import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Download } from 'lucide-react';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { buildUpiUri, getUpiAppMeta } from '../lib/utils';
import { PublicConnection } from '../types';

export interface QrCodePanelProps {
  profileUrl: string;
  recipientName: string;
  connections: PublicConnection[];
  amount?: string;
}

export const QrCodePanel: React.FC<QrCodePanelProps> = ({
  profileUrl,
  recipientName,
  connections,
  amount,
}) => {
  const [qrMode, setQrMode] = useState<'upi' | 'profile'>(
    connections.length > 0 ? 'upi' : 'profile'
  );
  const [selectedConnId, setSelectedConnId] = useState<string>(
    connections[0]?.id || ''
  );
  const [copied, setCopied] = useState(false);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (connections.length > 0) {
      if (!selectedConnId || !connections.some((c) => c.id === selectedConnId)) {
        setSelectedConnId(connections[0].id);
      }
    } else {
      setSelectedConnId('');
      setQrMode('profile');
    }
  }, [connections, selectedConnId]);

  const selectedConn =
    connections.find((c) => c.id === selectedConnId) || connections[0];

  const qrValue =
    qrMode === 'upi' && selectedConn
      ? buildUpiUri({
          vpa: selectedConn.upi_id,
          recipientName,
          amount,
          appType: selectedConn.application_type,
        })
      : profileUrl;

  const handleCopyValue = () => {
    navigator.clipboard.writeText(qrValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    const svgEl = svgContainerRef.current?.querySelector('svg');
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgEl);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trinetra-${qrMode}-qr.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {connections.length > 0 && (
        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#080C14] border border-[rgba(145,162,184,0.16)]">
          <button
            type="button"
            onClick={() => setQrMode('upi')}
            className={`py-2 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              qrMode === 'upi'
                ? 'bg-[#121E2E] text-[#F5F8FC] border border-[rgba(145,162,184,0.2)]'
                : 'text-[#91A2B8] hover:text-[#F5F8FC]'
            }`}
          >
            UPI Scan & Pay QR
          </button>
          <button
            type="button"
            onClick={() => setQrMode('profile')}
            className={`py-2 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              qrMode === 'profile'
                ? 'bg-[#121E2E] text-[#F5F8FC] border border-[rgba(145,162,184,0.2)]'
                : 'text-[#91A2B8] hover:text-[#F5F8FC]'
            }`}
          >
            Profile Link QR
          </button>
        </div>
      )}

      {qrMode === 'upi' && connections.length > 1 && (
        <Select
          label="UPI Destination"
          value={selectedConn?.id || ''}
          onChange={(e) => setSelectedConnId(e.target.value)}
          options={connections.map((c) => ({
            value: c.id,
            label: `${c.application_label || getUpiAppMeta(c.application_type).name} (${c.upi_id})`,
          }))}
        />
      )}

      <div className="flex flex-col items-center justify-center py-5 px-4 rounded-xl bg-[#080C14] border border-[rgba(145,162,184,0.14)]">
        <div ref={svgContainerRef} className="p-4 bg-white rounded-xl shadow-sm">
          <QRCodeSVG
            value={qrValue}
            size={188}
            level="M"
            bgColor="#FFFFFF"
            fgColor="#080C14"
          />
        </div>
        <p className="text-[11px] font-mono text-[#91A2B8] mt-3 text-center break-all max-w-xs">
          {qrMode === 'upi' && selectedConn
            ? `${selectedConn.upi_id}${amount && parseFloat(amount) > 0 ? ` · ₹${parseFloat(amount).toFixed(2)}` : ''}`
            : profileUrl}
        </p>
        <p className="text-[10px] font-mono text-[#64748B] mt-1 text-center break-all max-w-xs">
          {qrMode === 'upi' ? 'Encoded: upi://pay intent' : 'Encoded: Public TRINETRA link'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="secondary"
          size="md"
          onClick={handleCopyValue}
          leftIcon={
            copied ? (
              <Check className="w-3.5 h-3.5 text-[#28C987]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )
          }
        >
          {copied ? 'Copied' : qrMode === 'upi' ? 'Copy UPI Link' : 'Copy URL'}
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={handleDownloadSvg}
          leftIcon={<Download className="w-3.5 h-3.5" />}
        >
          Download QR
        </Button>
      </div>
    </div>
  );
};
