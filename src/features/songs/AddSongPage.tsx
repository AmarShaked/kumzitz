import { useSearchParams } from 'react-router-dom';
import AddFromTab4u from './AddFromTab4u';

/** Target of the phone's "Share → Kumzitz" (and of /add?url=… links). */
export default function AddSongPage() {
  const [params] = useSearchParams();
  const shared = [params.get('url'), params.get('text'), params.get('title')].filter(Boolean).join(' ');
  const hasLink = /tab4u\.com\/tabs\/songs\//i.test(shared);

  return (
    <div className="mx-auto max-w-xl p-4 sm:p-6 space-y-4">
      <h1 className="text-xl font-bold">הוספת שיר</h1>
      <AddFromTab4u initial={hasLink ? shared : ''} autoStart={hasLink} />
      {shared && !hasLink && (
        <p className="text-sm text-muted-foreground">לא מצאנו קישור לשיר ב-tab4u בתוכן ששותף. הדביקו קישור לעמוד של שיר.</p>
      )}
    </div>
  );
}
