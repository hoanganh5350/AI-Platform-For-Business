import React, { useState, useRef } from 'react';
import {
  Typography,
  Button,
  Space,
  Tooltip,
  Popconfirm,
  Progress,
  Tag,
  Divider,
  Spin,
} from 'antd';
import {
  FilePdfOutlined,
  FileWordOutlined,
  FileTextOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { DocumentMeta } from '../../api/types';
import { AdminAPI } from '../../api/client';
import { useAppNotification } from '../../hooks/useAppNotification';
import { useTranslation } from 'react-i18next';

const { Text, Title } = Typography;

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
const ACCEPTED_EXTS = '.pdf,.docx,.txt';
const MAX_FILES = 10;
const MAX_SIZE_MB = 50;

const MIME_ICON: Record<string, React.ReactNode> = {
  'application/pdf': <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': (
    <FileWordOutlined style={{ color: '#1677ff', fontSize: 20 }} />
  ),
  'text/plain': <FileTextOutlined style={{ color: '#52c41a', fontSize: 20 }} />,
};

const MIME_LABEL: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'text/plain': 'TXT',
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  businessId: string;
  documents: DocumentMeta[];
  onDocumentsChange: (docs: DocumentMeta[]) => void;
}

export const DocumentUpload: React.FC<Props> = ({ businessId, documents, onDocumentsChange }) => {
  const { notifySuccess, notifyError, contextHolder } = useAppNotification();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        notifyError(t('docs.error_type'), `"${file.name}" ${t('docs.error_type_desc')}`);
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        notifyError(t('docs.error_size'), `"${file.name}" ${t('docs.error_size_desc', { max: MAX_SIZE_MB })}`);
        continue;
      }
      if (documents.length >= MAX_FILES) {
        notifyError(t('docs.error_limit'), t('docs.error_limit_desc', { max: MAX_FILES }));
        return;
      }

      setUploadingFile(file.name);
      // Simulate progress
      let prog = 0;
      const interval = setInterval(() => {
        prog = Math.min(prog + 12, 85);
        setUploadProgress(prog);
      }, 200);

      try {
        const res = await AdminAPI.uploadDocument(businessId, file);
        clearInterval(interval);
        setUploadProgress(100);
        if (res.success && res.data) {
          const updated = [...documents, res.data as DocumentMeta];
          onDocumentsChange(updated);
          notifySuccess(t('docs.upload_success'), `"${file.name}" ${t('docs.upload_success_desc')}`);
        } else {
          notifyError(t('docs.upload_error'), res.message || t('docs.upload_error_desc'));
        }
      } catch (err: unknown) {
        clearInterval(interval);
        const message = err instanceof Error ? err.message : t('docs.upload_error_desc');
        notifyError(t('docs.upload_error'), message);
      } finally {
        setTimeout(() => {
          setUploadingFile(null);
          setUploadProgress(0);
        }, 600);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (index: number) => {
    setDeletingIndex(index);
    try {
      const res = await AdminAPI.deleteDocument(businessId, index);
      if (res.success) {
        const updated = documents.filter((_, i) => i !== index);
        onDocumentsChange(updated);
        notifySuccess(t('docs.delete_success'), t('docs.delete_success_desc'));
      } else {
        notifyError(t('docs.delete_error'), res.message);
      }
    } catch {
      notifyError(t('docs.delete_error'), t('docs.delete_error_desc'));
    } finally {
      setDeletingIndex(null);
    }
  };

  return (
    <div>
      {contextHolder}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Title level={5} style={{ margin: 0 }}>{t('docs.title')}</Title>
        <Tooltip title={t('docs.tooltip')}>
          <InfoCircleOutlined style={{ color: 'var(--color-text-60)', cursor: 'pointer' }} />
        </Tooltip>
      </div>
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
        {t('docs.subtitle')}
      </Text>

      {/* ── Drop Zone ── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !uploadingFile && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? '#1677ff' : 'rgba(128,128,128,0.28)'}`,
          borderRadius: 12,
          padding: '28px 20px',
          textAlign: 'center',
          cursor: uploadingFile ? 'not-allowed' : 'pointer',
          background: dragging
            ? 'rgba(22,119,255,0.05)'
            : 'var(--background-component)',
          transition: 'all 0.25s ease',
          marginBottom: 16,
          opacity: uploadingFile ? 0.7 : 1,
        }}
      >
        {uploadingFile ? (
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Spin size="small" />
            <Text style={{ fontSize: 13 }}>
              {t('docs.uploading')} <strong>"{uploadingFile}"</strong>...
            </Text>
            <Progress
              percent={uploadProgress}
              size="small"
              strokeColor={{ from: '#1677ff', to: '#722ed1' }}
              style={{ maxWidth: 300, margin: '0 auto' }}
            />
          </Space>
        ) : (
          <Space direction="vertical" size={4}>
            <CloudUploadOutlined style={{ fontSize: 32, color: '#1677ff' }} />
            <Text strong style={{ fontSize: 14 }}>{t('docs.drop_hint')}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              PDF, DOCX, TXT — {t('docs.max_hint', { max: MAX_SIZE_MB })}
            </Text>
          </Space>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTS}
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* ── Uploaded Documents List ── */}
      {documents.length > 0 && (
        <>
          <Divider style={{ margin: '12px 0' }} />
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            {documents.map((doc, idx) => (
              <div
                key={`${doc.name}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'var(--background-component)',
                  border: '1px solid rgba(128,128,128,0.15)',
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  {MIME_ICON[doc.mimeType] || <FileTextOutlined style={{ fontSize: 20 }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    strong
                    style={{ display: 'block', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    title={doc.name}
                  >
                    {doc.name}
                  </Text>
                  <Space size={6}>
                    <Tag
                      style={{ fontSize: 11, margin: 0, lineHeight: '18px', padding: '0 6px' }}
                      color="blue"
                    >
                      {MIME_LABEL[doc.mimeType] || 'FILE'}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 11 }}>{formatSize(doc.size)}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </Text>
                  </Space>
                </div>
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 15, flexShrink: 0 }} />
                <Popconfirm
                  title={t('docs.confirm_delete')}
                  description={t('docs.confirm_delete_desc')}
                  onConfirm={() => handleDelete(idx)}
                  okText={t('common.confirm')}
                  cancelText={t('common.cancel')}
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    loading={deletingIndex === idx}
                    style={{ flexShrink: 0 }}
                  />
                </Popconfirm>
              </div>
            ))}
          </Space>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
            {documents.length}/{MAX_FILES} {t('docs.file_count')}
          </Text>
        </>
      )}
    </div>
  );
};
