import React from 'react';
import { Form, Input, Button, Card } from 'antd';
import type { FormInstance } from 'antd/es/form';

const { TextArea } = Input;

interface Step1BusinessInfoProps {
  form: FormInstance;
  onNext: () => void;
}

export const Step1BusinessInfo: React.FC<Step1BusinessInfoProps> = ({ form, onNext }) => {
  return (
    <Card title="Khởi tạo Chatbot cho Doanh nghiệp" bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <Form form={form} layout="vertical">
        <Form.Item label="Tên doanh nghiệp" name="businessName" rules={[{ required: true, message: 'Vui lòng nhập tên doanh nghiệp' }]}>
          <Input placeholder="Nhập tên doanh nghiệp của bạn" />
        </Form.Item>
        <Form.Item label="Người đại diện" name="representative">
          <Input placeholder="Tên người đại diện" />
        </Form.Item>
        <Form.Item label="Thông tin liên lạc" name="contact">
          <Input placeholder="Email, Số điện thoại..." />
        </Form.Item>
        <Form.Item label="Lĩnh vực/Ngành nghề" name="industry">
          <Input placeholder="Ví dụ: Công nghệ, Bán lẻ, Giáo dục" />
        </Form.Item>
        <Form.Item label="Đường dẫn Website" name="website">
          <Input placeholder="https://..." />
        </Form.Item>
        <Form.Item label="Mô tả nghiệp vụ" name="description" rules={[{ required: true, message: 'Vui lòng mô tả nghiệp vụ' }]}>
          <TextArea rows={4} placeholder="Mô tả các sản phẩm, dịch vụ, và quy trình chính" />
        </Form.Item>
        <Form.Item label="Mục tiêu của chatbot" name="goal">
          <Input placeholder="Ví dụ: Chăm sóc khách hàng, Tư vấn bán hàng" />
        </Form.Item>
        <Button type="primary" onClick={onNext} block size="large">
          Tiếp tục
        </Button>
      </Form>
    </Card>
  );
};
