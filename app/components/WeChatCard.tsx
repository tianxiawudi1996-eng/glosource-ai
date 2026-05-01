import { Icon } from './icons';
import type { WeChatPost } from '../api/source/types';

interface WeChatCardProps {
  post: WeChatPost;
}

export default function WeChatCard({ post }: WeChatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[#0D1B2A] leading-snug">{post.articleTitle}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400">{post.accountName}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full border ${
              post.accountType.includes('공장') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              post.accountType.includes('무역') ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-slate-50 text-slate-500 border-slate-200'
            }`}>{post.accountType}</span>
            <span className="text-xs text-slate-400">{post.publishDate}</span>
          </div>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg border flex-shrink-0 ${
          post.relevanceScore >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          post.relevanceScore >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' :
          'bg-slate-50 text-slate-500 border-slate-200'
        }`}>{post.relevanceScore}점</span>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed mb-2">{post.summary}</p>
      {post.productKeywords.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {post.productKeywords.map((kw, i) => (
            <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{kw}</span>
          ))}
        </div>
      )}
      {post.contactHint && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2">
          <p className="text-xs text-amber-800"><span className="font-semibold">연락처 힌트:</span> {post.contactHint}</p>
        </div>
      )}
      <a href={post.url} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors">
        <Icon.ExternalLink className="w-3 h-3" />WeChat 원문 보기
      </a>
    </div>
  );
}
