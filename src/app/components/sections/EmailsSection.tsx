import FetchedEmailsCard from "../FetchedEmailsCard";
import { CardCategory } from "@/app/page";
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
  unreadEmailsByCategory?: Record<string, Set<string>>;
  onCategoryOpened?: (categoryName: string, emailIds: string[]) => void;
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
    <section className="space-y-6">
      <div className="flex items-center justify-between">
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
            <button
              onClick={onBulkApply}
              disabled={!selectedEmails.size}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply to {selectedEmails.size} email{selectedEmails.size !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>

      {(() => {
        // Get all account emails from both accounts list and byAccount
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
            <div className="text-center py-12 bg-white border-2 rounded-xl shadow-lg">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
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
