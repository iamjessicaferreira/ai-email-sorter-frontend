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
};

export default function FetchedEmailsCard({
  accountEmail,
  categories,
  rawEmails,
  selectedEmails,
  unsubscribedEmails,
  toggleEmailSelection,
  selectAllEmails,
  onEmailClick,
}: Props) {
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [openRaw, setOpenRaw] = useState(false);

  const allIds = [
    ...categories.flatMap((cat) =>
      rawEmails.filter((e) => e.category === cat.name).map((e) => e.id)
    ),
    ...rawEmails
      .filter((e) => !categories.some((c) => c.name === e.category))
      .map((e) => e.id),
  ];
  const allSelected = allIds.every((id) => selectedEmails.has(id));

  return (
    <div className="border rounded-xl p-4 shadow bg-white mb-6">
      <h2 className="text-xl font-bold mb-3">{accountEmail}</h2>

      {allIds.length > 0 && (
        <label className="inline-flex items-center mb-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => selectAllEmails(e.target.checked)}
            className="mr-2"
          />
          <span className="font-semibold">Select all from account</span>
        </label>
      )}

      {categories.map((cat) => {
        const emailsForCat = rawEmails.filter((e) => e.category === cat.name);

        return (
          <div key={cat.name} className="border rounded-md mb-4">
            <button
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 flex justify-between"
              onClick={() => setOpenCat(openCat === cat.name ? null : cat.name)}
            >
              <span className="font-semibold">{cat.name}</span>
              <span>{openCat === cat.name ? "▲" : "▼"}</span>
            </button>
            {openCat === cat.name && (
              <div>
                {cat.description && (
                  <p className="text-m text-gray-600 mt-2 mb-2 px-4">
                    {cat.description}
                  </p>
                )}
                <ul className="p-4 space-y-3 max-h-64 overflow-y-auto">
                  {emailsForCat.length === 0 ? (
                    <p className="text-gray-500">No emails in this category.</p>
                  ) : (
                    emailsForCat.map((e) => (
                      <li
                        key={e.id}
                        className="p-3 border rounded-md bg-gray-50 flex flex-col cursor-pointer hover:bg-gray-100"
                      >
                        <label className="inline-flex items-center mb-1">
                          <input
                            type="checkbox"
                            checked={selectedEmails.has(e.id)}
                            onChange={(ev) => {
                              ev.stopPropagation();
                              toggleEmailSelection(e.id);
                            }}
                            className="mr-2"
                          />
                          <h3 className="font-semibold flex items-center">
                            {e.subject}
                            {unsubscribedEmails.has(e.id) && (
                              <span className="italic text-xs text-gray-500 ml-2">
                                unsubscribed
                              </span>
                            )}
                          </h3>
                        </label>
                        {e.summary && (
                          <p
                            onClick={() => onEmailClick(e.id)}
                            className="italic text-sm mb-1 cursor-pointer hover:underline"
                          >
                            {e.summary}
                          </p>
                        )}
                        {e.received_at && (
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(e.received_at).toLocaleString()}
                          </p>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        );
      })}

      {rawEmails.some((e) => !categories.some((c) => c.name === e.category)) && (
        <div className="border rounded-md">
          <button
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 flex justify-between"
            onClick={() => setOpenRaw(!openRaw)}
          >
            <span className="font-semibold">Uncategorized emails</span>
            <span>{openRaw ? "▲" : "▼"}</span>
          </button>
          {openRaw && (
            <ul className="p-4 space-y-3 max-h-64 overflow-y-auto">
              {rawEmails
                .filter((e) => !categories.some((c) => c.name === e.category))
                .map((e) => (
                  <li
                    key={e.id}
                    className="p-3 border rounded-md bg-gray-50 flex flex-col"
                  >
                    <label className="inline-flex items-center mb-1">
                      <input
                        type="checkbox"
                        checked={selectedEmails.has(e.id)}
                        onChange={() => toggleEmailSelection(e.id)}
                        className="mr-2"
                      />
                      <h3 className="font-semibold">{e.subject}</h3>
                    </label>
                    <div
                      className="text-sm text-gray-700"
                      dangerouslySetInnerHTML={{ __html: e.body }}
                    />
                    {e.received_at && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(e.received_at).toLocaleString()}
                      </p>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
