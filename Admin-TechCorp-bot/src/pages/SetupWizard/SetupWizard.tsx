import React, { useState } from 'react';
import { Steps, Form, message } from 'antd';
import { AppThemeProvider } from '../../components/AppThemeProvider/AppThemeProvider';
import { AdminAPI } from '../../api/client';
import type { UIFlowNode } from '../../api/types';
import type { BusinessDataForm, UIBlockForm } from './SetupWizard.types';

import { Step1BusinessInfo } from './components/Step1BusinessInfo';
import { Step2UIFlow } from './components/Step2UIFlow';
import { Step3Success } from './components/Step3Success';

export const SetupWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [businessData, setBusinessData] = useState<Partial<BusinessDataForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBusinessId, setCreatedBusinessId] = useState<string | null>(null);

  const [form1] = Form.useForm();
  const [form2] = Form.useForm();

  const handleNextStep1 = async () => {
    try {
      // validate registered fields (required rules etc.)
      await form1.validateFields();
      // getFieldsValue(true) fetches ALL values including those set via setFieldValue
      // that don't have a corresponding <Form.Item> (e.g. customFieldTitles)
      const values = form1.getFieldsValue(true);
      setBusinessData(values);
      setCurrentStep(1);
    } catch (error) {
      console.error('Validation Failed:', error);
    }
  };

  const handleNextStep2 = async () => {
    try {
      const values = await form2.validateFields();
      const blocks: UIBlockForm[] = values.blocks || [];
      
      // Transform flat blocks to tree structure
      const nodeMap: Record<string, UIFlowNode> = {};
      const tree: UIFlowNode[] = [];
      
      // First pass: create nodes
      blocks.forEach((block: UIBlockForm, index: number) => {
        const id = block.name ? block.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : `node-${index}`;
        // Use admin-provided absolute URL if set, else fallback to generated path
        const url = block.absoluteUrl?.trim() || `/${id}`;
        nodeMap[id] = {
          id,
          name: block.name,
          description: block.description,
          actionType: 'navigate',
          url,
          children: []
        };
        block._id = id; // temp ID
      });
      
      // Second pass: build tree
      blocks.forEach((block: UIBlockForm) => {
        const node = nodeMap[block._id!];
        if (block.parent && nodeMap[block.parent]) {
          node.parentId = block.parent;
          nodeMap[block.parent].children!.push(node);
        } else {
          tree.push(node);
        }
      });
      
      setCurrentStep(2);
      submitAll(tree);
    } catch (error) {
      console.error('Validation Failed:', error);
    }
  };

  const submitAll = async (tree: UIFlowNode[]) => {
    setIsSubmitting(true);
    try {
      // Generate random ID if none provided
      const businessId = (businessData.businessName || 'biz').toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);
      
      // Build description string: base + representative/goal + custom extra fields
      const baseDescription = `Representative: ${businessData.representative || 'N/A'}\nGoal: ${businessData.goal || 'N/A'}\n\n${businessData.description}`;
      const customFieldsObj = businessData.customFields || {};
      const customFieldTitles = businessData.customFieldTitles || {};
      const customSections = Object.entries(customFieldsObj)
        .filter(([, v]) => v && String(v).trim())
        // Use the actual title stored in customFieldTitles, fallback to key if missing
        .map(([k, v]) => `[${customFieldTitles[k] || k}]: ${v}`)
        .join('\n');
      const fullDescription = customSections
        ? `${baseDescription}\n\n--- Thông tin bổ sung ---\n${customSections}`
        : baseDescription;

      const payload = {
        businessId,
        businessName: businessData.businessName || '',
        industry: businessData.industry,
        contact: businessData.contact,
        website: businessData.website,
        description: fullDescription,
        tone: 'professional' as const,
        chatbotName: 'SupportBot',
        welcomeMessage: 'Xin chào! Tôi có thể giúp gì cho bạn?',
        language: 'auto',
        uiFlowTree: tree,
      };

      const res = await AdminAPI.createBusinessConfig(payload);
      if (res.success) {
        // Use the authoritative businessId returned by the server (may differ if user already had a businessId in JWT)
        const confirmedBusinessId = res.businessId || businessId;
        setCreatedBusinessId(confirmedBusinessId);
        // Update localStorage with confirmed businessId and the new JWT token (contains updated businessId)
        localStorage.setItem('currentBusinessId', confirmedBusinessId);
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
      } else {
        message.error('Có lỗi xảy ra khi tạo cấu hình');
      }
    } catch (err) {
      message.error('Kết nối server thất bại');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppThemeProvider>
      <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
        <Steps current={currentStep} style={{ marginBottom: 40 }}>
          <Steps.Step title="Thông tin Doanh nghiệp" />
          <Steps.Step title="Cấu hình Luồng (UI Flow)" />
          <Steps.Step title="Hoàn thành" />
        </Steps>

        {currentStep === 0 && (
          <Step1BusinessInfo form={form1} onNext={handleNextStep1} />
        )}

        {currentStep === 1 && (
          <Step2UIFlow form={form2} onBack={() => setCurrentStep(0)} onFinish={handleNextStep2} />
        )}

        {currentStep === 2 && (
          <Step3Success isSubmitting={isSubmitting} businessId={createdBusinessId} />
        )}
      </div>
    </AppThemeProvider>
  );
};
