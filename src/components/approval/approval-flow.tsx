import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, ArrowRight } from 'lucide-react';
import type { ApprovalLine } from '@/types';

interface ApprovalFlowProps {
  lines: (ApprovalLine & { approverName: string; approverRank: string })[];
}

export function ApprovalFlow({ lines }: ApprovalFlowProps) {
  const statusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <Check className="h-3 w-3 text-green-600" />;
      case 'rejected': return <X className="h-3 w-3 text-red-600" />;
      default: return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'border-green-500 bg-green-50';
      case 'rejected': return 'border-red-500 bg-red-50';
      default: return 'border-muted';
    }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2">
      {lines.map((line, idx) => (
        <div key={line.id} className="flex items-center gap-2">
          <div className={`flex flex-col items-center gap-1 p-3 border-2 rounded-lg min-w-[100px] ${statusColor(line.status)}`}>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{line.approverName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{line.approverName}</span>
            <span className="text-[10px] text-muted-foreground">{line.approverRank}</span>
            <div className="flex items-center gap-1">
              {statusIcon(line.status)}
              <Badge variant={line.status === 'approved' ? 'default' : line.status === 'rejected' ? 'destructive' : 'secondary'} className="text-[10px] h-4">
                {line.status === 'approved' ? '승인' : line.status === 'rejected' ? '반려' : '대기'}
              </Badge>
            </div>
            {line.acted_at && (
              <span className="text-[10px] text-muted-foreground">{line.acted_at.slice(0, 10)}</span>
            )}
          </div>
          {idx < lines.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
        </div>
      ))}
    </div>
  );
}
