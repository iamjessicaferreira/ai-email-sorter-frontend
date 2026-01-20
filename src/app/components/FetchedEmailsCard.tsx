import React, { useState } from "react";

type Email = {
  id: string;
  subject: string;
  body: string;
  summary?: string;
  received_at?: string;
  category: string;
};

type Category = {
  name: string;
  description: string;
  synonyms?: string[];
};

type Props = {
  accountEmail: string;
  categories: Category[];
  rawEmails: Email[];
  selectedEmails: Set<string>;
  unsubscribedEmails: Set<string>;
  toggleEmailSelection: (emailId: string) => void;
  selectAllEmails: (selectAll: boolean) => void;
  onEmailClick: (id: string) => void;
  onRecategorize?: (emailId: string) => Promise<void>;
  unreadEmailsByCategory?: Record<string, Set<string>>;
  onCategoryOpened?: (categoryName: string, emailIds: string[]) => void;
};

function RecategorizeButton({
  emailId,
  onRecategorize,
  isRecategorizing,
  setIsRecategorizing,
}: {
  emailId: string;
  onRecategorize: (emailId: string) => Promise<void>;
  isRecategorizing: boolean;
  setIsRecategorizing: (value: boolean) => void;
}) {
  const handleClick = async (ev: React.MouseEvent) => {
    ev.stopPropagation();
    setIsRecategorizing(true);
    try {
      await onRecategorize(emailId);
    } finally {
      setIsRecategorizing(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isRecategorizing}
      className="
        absolute top-2 right-2 p-2 rounded-lg 
        bg-gradient-to-r from-blue-500 to-blue-600 text-white 
        hover:from-blue-600 hover:to-blue-700 
        disabled:opacity-50 disabled:cursor-not-allowed 
        text-xs z-10 shadow-md hover:shadow-lg
        transition-all duration-300 ease-out
        hover:scale-110 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        group
      "
      title="Recategorize this email using AI"
      aria-label="Recategorize email"
    >
      {isRecategorizing ? (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <span className="text-base">↻</span>
      )}
    </button>
  );
}

export default function FetchedEmailsCard({
  accountEmail,
  categories,
  rawEmails,
  selectedEmails,
  unsubscribedEmails,
  toggleEmailSelection,
  selectAllEmails,
  onEmailClick,
  onRecategorize,
  unreadEmailsByCategory = {},
  onCategoryOpened,
}: Props) {
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [openRaw, setOpenRaw] = useState(false);
  const [recategorizingEmails, setRecategorizingEmails] = useState<Set<string>>(new Set());
  
  const handleCategoryToggle = (categoryName: string, emailIds: string[]) => {
    if (openCat === categoryName) {
      setOpenCat(null);
    } else {
      setOpenCat(categoryName);
      // Mark emails as read when category is opened
      if (onCategoryOpened) {
        onCategoryOpened(categoryName, emailIds);
      }
    }
  };

  const uniqueEmails = Array.from(
    new Map(rawEmails.map((e) => [e.id, e])).values()
  );

  const allIds = [
    ...categories.flatMap((cat) =>
      uniqueEmails.filter((e) => e.category === cat.name).map((e) => e.id)
    ),
    ...uniqueEmails
      .filter((e) => !categories.some((c) => c.name === e.category))
      .map((e) => e.id),
  ];
  const allSelected = allIds.every((id) => selectedEmails.has(id));

  return (
    <div className="border-2 rounded-xl p-6 shadow-elegant bg-white mb-6 animate-slide-up hover:shadow-elegant-hover transition-all duration-300">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {accountEmail}
      </h2>

      {allIds.length > 0 && (
        <label className="
          inline-flex items-center mb-4 p-3 bg-gray-50 border-2 rounded-lg 
          hover:bg-gray-100 hover:shadow-md hover:scale-[1.02]
          cursor-pointer transition-all duration-300 ease-out
          active:scale-[0.98]
        ">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => selectAllEmails(e.target.checked)}
            className="mr-3 w-4 h-4 cursor-pointer accent-blue-600"
          />
          <span className="font-semibold text-gray-900">Select all from account</span>
        </label>
      )}

      {categories.map((cat) => {
        const emailsForCat = uniqueEmails.filter((e) => e.category === cat.name);
        const unreadCount = unreadEmailsByCategory[cat.name]?.size || 0;
        const emailIds = emailsForCat.map(e => e.id);

        return (
          <div key={cat.name} className="border-2 rounded-lg mb-4 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <button
              className="
                w-full px-5 py-3 bg-gradient-to-r from-blue-50 to-purple-50 
                hover:from-blue-100 hover:to-purple-100 
                flex justify-between items-center 
                transition-all duration-300 ease-out
                hover:scale-[1.01] active:scale-[0.99]
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              "
              onClick={() => handleCategoryToggle(cat.name, emailIds)}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900 text-lg">{cat.name}</span>
                {unreadCount > 0 && (
                  <span className="
                    bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full 
                    min-w-[24px] text-center
                    animate-pulse shadow-md
                    transform transition-transform duration-300 hover:scale-110
                  ">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-gray-600">{openCat === cat.name ? "▲" : "▼"}</span>
            </button>
            {openCat === cat.name && (
              <div>
                {cat.description && (
                  <p className="text-sm text-gray-600 mt-3 mb-3 px-5">
                    {cat.description}
                  </p>
                )}
                <ul className="p-5 space-y-3 max-h-64 overflow-y-auto bg-white">
                  {emailsForCat.length === 0 ? (
                    <p className="text-gray-500">No emails in this category.</p>
                  ) : (
                    emailsForCat.map((e, index) => (
                      <li
                        key={`${accountEmail}-${e.id}`}
                        className="
                          p-4 border-2 rounded-lg bg-white 
                          hover:shadow-elegant-hover hover:scale-[1.02] hover:border-blue-300
                          transition-all duration-300 ease-out relative
                          animate-slide-up
                        "
                        style={{
                          animationDelay: `${index * 0.05}s`
                        }}
                      >
                        {onRecategorize && (
                          <RecategorizeButton
                            emailId={e.id}
                            onRecategorize={onRecategorize}
                            isRecategorizing={recategorizingEmails.has(e.id)}
                            setIsRecategorizing={(value) => {
                              setRecategorizingEmails((prev) => {
                                const next = new Set(prev);
                                if (value) {
                                  next.add(e.id);
                                } else {
                                  next.delete(e.id);
                                }
                                return next;
                              });
                            }}
                          />
                        )}
                        <div className="flex items-start gap-2 mb-1 pr-8">
                          <input
                            type="checkbox"
                            checked={selectedEmails.has(e.id)}
                            onChange={(ev) => {
                              ev.stopPropagation();
                              toggleEmailSelection(e.id);
                            }}
                            onClick={(ev) => ev.stopPropagation()}
                            className="mt-1 flex-shrink-0"
                          />
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => onEmailClick(e.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(ev) => {
                              if (ev.key === 'Enter' || ev.key === ' ') {
                                ev.preventDefault();
                                onEmailClick(e.id);
                              }
                            }}
                            aria-label={`View email: ${e.subject}`}
                          >
                            <h3 className="font-semibold flex items-center hover:text-blue-600">
                              {e.subject}
                              {unsubscribedEmails.has(e.id) && (
                                <span className="italic text-xs text-gray-500 ml-2">
                                  unsubscribed
                                </span>
                              )}
                            </h3>
                            {e.summary && (
                              <p className="italic text-sm mb-1 text-gray-600 hover:underline">
                                {e.summary}
                              </p>
                            )}
                            {e.received_at && (
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(e.received_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        );
      })}

      {(() => {
        const uncategorizedEmails = uniqueEmails.filter((e) => !categories.some((c) => c.name === e.category));
        const uncategorizedIds = uncategorizedEmails.map(e => e.id);
        const uncategorizedUnread = unreadEmailsByCategory["Uncategorized"]?.size || 0;
        
        return uncategorizedEmails.length > 0 && (
          <div className="border-2 rounded-lg mb-4 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <button
              className="
                w-full px-5 py-3 bg-gradient-to-r from-blue-50 to-purple-50 
                hover:from-blue-100 hover:to-purple-100 
                flex justify-between items-center 
                transition-all duration-300 ease-out
                hover:scale-[1.01] active:scale-[0.99]
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              "
              onClick={() => {
                setOpenRaw(!openRaw);
                if (!openRaw && onCategoryOpened) {
                  // Mark uncategorized emails as read when opened
                  onCategoryOpened("Uncategorized", uncategorizedIds);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900 text-lg">Uncategorized Emails</span>
                {uncategorizedUnread > 0 && (
                  <span className="
                    bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full 
                    min-w-[24px] text-center
                    animate-pulse shadow-md
                    transform transition-transform duration-300 hover:scale-110
                  ">
                    {uncategorizedUnread > 99 ? '99+' : uncategorizedUnread}
                  </span>
                )}
              </div>
              <span className="text-gray-600">{openRaw ? "▲" : "▼"}</span>
            </button>
            {openRaw && (
            <ul className="p-5 space-y-3 max-h-64 overflow-y-auto bg-white">
              {uniqueEmails
                .filter((e) => !categories.some((c) => c.name === e.category))
                .map((e, index) => (
                  <li
                    key={`${accountEmail}-uncategorized-${e.id}`}
                    className="
                      p-4 border-2 rounded-lg bg-white 
                      hover:shadow-elegant-hover hover:scale-[1.02] hover:border-blue-300
                      transition-all duration-300 ease-out relative
                      animate-slide-up
                    "
                    style={{
                      animationDelay: `${index * 0.05}s`
                    }}
                  >
                    {onRecategorize && (
                      <RecategorizeButton
                        emailId={e.id}
                        onRecategorize={onRecategorize}
                        isRecategorizing={recategorizingEmails.has(e.id)}
                        setIsRecategorizing={(value) => {
                          setRecategorizingEmails((prev) => {
                            const next = new Set(prev);
                            if (value) {
                              next.add(e.id);
                            } else {
                              next.delete(e.id);
                            }
                            return next;
                          });
                        }}
                      />
                    )}
                    <div className="flex items-start gap-2 mb-1 pr-8">
                      <input
                        type="checkbox"
                        checked={selectedEmails.has(e.id)}
                        onChange={(ev) => {
                          ev.stopPropagation();
                          toggleEmailSelection(e.id);
                        }}
                        onClick={(ev) => ev.stopPropagation()}
                        className="mt-1 flex-shrink-0"
                      />
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => onEmailClick(e.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(ev) => {
                          if (ev.key === 'Enter' || ev.key === ' ') {
                            ev.preventDefault();
                            onEmailClick(e.id);
                          }
                        }}
                      >
                        <h3 className="font-semibold hover:text-blue-600">{e.subject}</h3>
                        {e.received_at && (
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(e.received_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div
                      className="text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      onClick={() => onEmailClick(e.id)}
                      dangerouslySetInnerHTML={{ __html: e.body.substring(0, 200) + (e.body.length > 200 ? '...' : '') }}
                    />
                    {e.body.length > 200 && (
                      <button
                        onClick={() => onEmailClick(e.id)}
                        className="text-xs text-blue-600 hover:underline mt-1 self-start"
                      >
                        Ver conteúdo completo →
                      </button>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </div>
        );
      })()}
    </div>
  );
}
