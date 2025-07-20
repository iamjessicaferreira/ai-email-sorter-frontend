import React, { useState } from "react";

type Email = {
  id: string;
  subject: string;
  body: string;
  summary?: string;
  received_at?: string;
  hasReviewedByAI: boolean;
};

type Category = {
  name: string;
  description: string;
  emails: Email[];
};

type FetchedEmailsCardProps = {
  accountEmail: string;
  categories: Category[];
  rawEmails: Email[];
  selectedEmails: Set<string>;
  toggleEmailSelection: (emailId: string) => void;
  selectAllEmails: (selectAll: boolean) => void;
};

export default function FetchedEmailsCard({
  accountEmail,
  categories,
  rawEmails,
  selectedEmails,
  toggleEmailSelection,
  selectAllEmails,
}: FetchedEmailsCardProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openRaw, setOpenRaw] = useState<boolean>(false);

  const toggleCategory = (name: string) => {
    setOpenCategory((prev) => (prev === name ? null : name));
  };
  const toggleRaw = () => setOpenRaw((prev) => !prev);

  // Pegar todos os emails da conta para o "select all"
  const allEmailIds = [
    ...categories.flatMap((cat) => cat.emails.map((email) => email.id)),
    ...rawEmails.map((email) => email.id),
  ];

  // Verificar se todos estão selecionados para a conta
  const allSelected = allEmailIds.every((id) => selectedEmails.has(id));

  return (
    <div className="border rounded-xl p-4 shadow-md bg-white mb-6">
      <h2 className="text-xl font-bold mb-3">{accountEmail}</h2>

      {(categories.length > 0 || rawEmails.length > 0) && (
        <div className="mb-2">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => selectAllEmails(e.target.checked)}
            />
            <span className="ml-2 font-semibold">
              Selecionar todos da conta
            </span>
          </label>
        </div>
      )}

      {categories.length === 0 && rawEmails.length === 0 ? (
        <p className="text-gray-500">Nenhum e-mail encontrado.</p>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.name} className="border rounded-md">
              <button
                className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 flex justify-between items-center"
                onClick={() => toggleCategory(cat.name)}
              >
                <span className="font-semibold">{cat.name}</span>
                <span className="text-sm text-gray-600">{cat.description}</span>
                <span>{openCategory === cat.name ? "▲" : "▼"}</span>
              </button>

              {openCategory === cat.name && (
                <ul className="p-4 space-y-3 max-h-64 overflow-y-auto">
                  {cat.emails.length === 0 ? (
                    <p className="text-gray-500">
                      Nenhum e-mail nesta categoria.
                    </p>
                  ) : (
                    cat.emails.map((email) => (
                      <li
                        key={email.id}
                        className="p-3 border rounded-md bg-gray-50 flex flex-col space-y-1"
                      >
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedEmails.has(email.id)}
                            onChange={() => toggleEmailSelection(email.id)}
                            className="mr-2"
                          />
                          <h3 className="font-semibold text-lg">
                            {email.subject}
                          </h3>
                        </label>

                        {email.hasReviewedByAI && email.summary && (
                          <p className="text-sm text-gray-600 italic mb-1">
                            {email.summary}
                          </p>
                        )}
                        <div
                          className="text-sm text-gray-700"
                          dangerouslySetInnerHTML={{ __html: email.body }}
                        />
                        {email.received_at && (
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(email.received_at).toLocaleString()}
                          </p>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          ))}

          {/* Seção de e-mails não categorizados */}
          {rawEmails.length > 0 && (
            <div className="border rounded-md">
              <button
                className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 flex justify-between items-center"
                onClick={toggleRaw}
              >
                <span className="font-semibold">E-mails sem categoria</span>
                <span>{openRaw ? "▲" : "▼"}</span>
              </button>

              {openRaw && (
                <ul className="p-4 space-y-3 max-h-64 overflow-y-auto">
                  {rawEmails.map((email) => (
                    <li
                      key={email.id}
                      className="p-3 border rounded-md bg-gray-50 flex flex-col space-y-1"
                    >
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedEmails.has(email.id)}
                          onChange={() => toggleEmailSelection(email.id)}
                          className="mr-2"
                        />
                        <h3 className="font-semibold text-lg">
                          {email.subject}
                        </h3>
                      </label>

                      <div
                        className="text-sm text-gray-700"
                        dangerouslySetInnerHTML={{ __html: email.body }}
                      />
                      {email.received_at && (
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(email.received_at).toLocaleString()}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
