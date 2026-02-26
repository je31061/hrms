'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface ApprovalFormProps {
  approvalId: string;
  onApprove?: () => void;
  onReject?: () => void;
}

export function ApprovalActionForm({ approvalId, onApprove, onReject }: ApprovalFormProps) {
  const [comment, setComment] = useState('');

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="space-y-2">
        <Label>의견</Label>
        <Textarea
          placeholder="결재 의견을 입력하세요"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="destructive"
          onClick={() => {
            toast.error('결재가 반려되었습니다.');
            onReject?.();
          }}
        >
          <X className="h-4 w-4 mr-2" />
          반려
        </Button>
        <Button
          onClick={() => {
            toast.success('결재가 승인되었습니다.');
            onApprove?.();
          }}
        >
          <Check className="h-4 w-4 mr-2" />
          승인
        </Button>
      </div>
    </div>
  );
}
