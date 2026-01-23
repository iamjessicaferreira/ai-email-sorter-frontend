import FetchedEmailsCard from "../FetchedEmailsCard";
import { CardCategory } from "@/app/page";
import { Button } from "@/components/ui/button";
type Incoming = {
  account: string;
  id: string;
  subject: string;
  body: string;
  summary: string;
  received_at: string;
  category: string;
};

type Props = {
  byAccount: Record<string, Incoming[]>;
  selectedEmails: Set<string>;
  unsubscribedEmails: Set<string>;
  cardCategories: CardCategory[];
  action: "delete" | "unsubscribe";
  onActionChange: (action: "delete" | "unsubscribe") => void;
  onBulkApply: () => void;
  onToggleSelect: (id: string) => void;
  onSelectAll: (account: string, sel: boolean) => void;
  onEmailClick: (id: string) => void;
  onRecategorize?: (emailId: string) => Promise<void>;
  unreadEmailsByCategory?: Record<string, Record<string, Set<string>>>;
  onCategoryOpened?: (accountEmail: string, categoryName: string, emailIds: string[]) => void;
  accounts?: Array<{ uid: string; email: string | null }>;
};

export default function EmailsSection({
  byAccount,
  selectedEmails,
  unsubscribedEmails,
  cardCategories,
  action,
  onBulkApply,
  onToggleSelect,
  onSelectAll,
  onEmailClick,
  onActionChange,
  onRecategorize,
  unreadEmailsByCategory = {},
  onCategoryOpened,
  accounts = [],
}: Props) {
  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-slide-in">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            New Emails
          </h2>
          <p className="text-gray-600 mt-1">Manage and organize your incoming emails</p>
        </div>
        {selectedEmails.size > 0 && (
          <div className="flex items-center gap-3">
            <select
              value={action}
              onChange={e => onActionChange(e.target.value as "delete" | "unsubscribe")}
              className="border-2 rounded-lg px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="delete">Delete</option>
              <option value="unsubscribe">Unsubscribe</option>
            </select>
            <Button
              onClick={onBulkApply}
              disabled={!selectedEmails.size}
              variant="destructive"
              tooltip={action === "delete" ? "Delete selected emails permanently" : "Unsubscribe from selected email senders"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {action === "delete" ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                )}
              </svg>
              Apply to {selectedEmails.size} email{selectedEmails.size !== 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </div>

      {(() => {
        const allAccountEmails = new Set<string>();
        accounts.forEach(acc => {
          if (acc.email) {
            allAccountEmails.add(acc.email);
          }
        });
        Object.keys(byAccount).forEach(email => allAccountEmails.add(email));
        
        const accountEmailsArray = Array.from(allAccountEmails);
        
        if (accountEmailsArray.length === 0) {
          return (
            <div className="text-center py-12 bg-white border-2 rounded-xl shadow-elegant animate-scale-in">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-600 text-lg">Your new messages will appear here.</p>
            </div>
          );
        }
        
        return accountEmailsArray.map((accountEmail) => (
          <FetchedEmailsCard
            key={accountEmail}
            accountEmail={accountEmail}
            categories={cardCategories}
            rawEmails={byAccount[accountEmail] || []}
            selectedEmails={selectedEmails}
            toggleEmailSelection={onToggleSelect}
            selectAllEmails={sel => onSelectAll(accountEmail, sel)}
            unsubscribedEmails={unsubscribedEmails}
            onEmailClick={onEmailClick}
            onRecategorize={onRecategorize}
            unreadEmailsByCategory={unreadEmailsByCategory}
            onCategoryOpened={onCategoryOpened}
          />
        ));
      })()}
    </section>
  );
}
