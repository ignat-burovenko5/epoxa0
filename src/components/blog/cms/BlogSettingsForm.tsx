"use client";

import { useState } from "react";
import {
  cmsInputClass,
  cmsLabelClass,
  cmsSectionClass,
  cmsSectionTitleClass,
  cmsTextareaClass,
} from "@/components/blog/cms/cms-field-styles";
import type { BlogSettings } from "@/lib/blog/types";

type BlogSettingsFormProps = {
  settings: BlogSettings;
};

export default function BlogSettingsForm({ settings: initial }: BlogSettingsFormProps) {
  const [settings, setSettings] = useState<BlogSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/blog/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = (await res.json()) as BlogSettings & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Ошибка сохранения");
        return;
      }
      setSettings(data);
      setMessage("Настройки сохранены");
    } catch {
      setError("Ошибка сети");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 max-w-2xl">
      {error ? (
        <p className="font-sans text-sm text-red-300/90" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="font-sans text-sm text-accent-gold/90">{message}</p>
      ) : null}

      <section className={cmsSectionClass}>
        <h2 className={cmsSectionTitleClass}>Раздел блога (публичный URL)</h2>
        <label className="flex items-center gap-3 font-sans text-sm text-museum-light/70 mb-4">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
            className="size-4 accent-accent-gold"
          />
          Блог включён на сайте
        </label>
        <div>
          <label htmlFor="pageSize" className={cmsLabelClass}>
            Записей на страницу (3–24)
          </label>
          <input
            id="pageSize"
            type="number"
            min={3}
            max={24}
            value={settings.pageSize}
            onChange={(e) =>
              setSettings({ ...settings, pageSize: Number(e.target.value) })
            }
            className={cmsInputClass}
          />
        </div>
        <div>
          <label htmlFor="indexTitle" className={cmsLabelClass}>
            Заголовок списка
          </label>
          <input
            id="indexTitle"
            required
            value={settings.index.title}
            onChange={(e) =>
              setSettings({
                ...settings,
                index: { ...settings.index, title: e.target.value },
              })
            }
            className={cmsInputClass}
          />
        </div>
        <div>
          <label htmlFor="indexDesc" className={cmsLabelClass}>
            Описание (meta + подзаголовок)
          </label>
          <textarea
            id="indexDesc"
            value={settings.index.description}
            onChange={(e) =>
              setSettings({
                ...settings,
                index: { ...settings.index, description: e.target.value },
              })
            }
            className={cmsTextareaClass}
            rows={3}
          />
        </div>
        <div>
          <label htmlFor="emptyMsg" className={cmsLabelClass}>
            Текст при пустом списке
          </label>
          <input
            id="emptyMsg"
            value={settings.index.emptyMessage}
            onChange={(e) =>
              setSettings({
                ...settings,
                index: { ...settings.index, emptyMessage: e.target.value },
              })
            }
            className={cmsInputClass}
          />
        </div>
        <div>
          <label htmlFor="itemLabel" className={cmsLabelClass}>
            Подпись счётчика («записей»)
          </label>
          <input
            id="itemLabel"
            value={settings.index.itemLabel}
            onChange={(e) =>
              setSettings({
                ...settings,
                index: { ...settings.index, itemLabel: e.target.value },
              })
            }
            className={cmsInputClass}
          />
        </div>
        <div>
          <label htmlFor="dashTitle" className={cmsLabelClass}>
            Заголовок панели CMS
          </label>
          <input
            id="dashTitle"
            value={settings.dashboardTitle}
            onChange={(e) =>
              setSettings({ ...settings, dashboardTitle: e.target.value })
            }
            className={cmsInputClass}
          />
        </div>
        <div>
          <label htmlFor="defaultAuthor" className={cmsLabelClass}>
            Автор по умолчанию для новых записей
          </label>
          <input
            id="defaultAuthor"
            value={settings.defaultAuthor ?? ""}
            onChange={(e) =>
              setSettings({ ...settings, defaultAuthor: e.target.value })
            }
            className={cmsInputClass}
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={saving}
        className="min-h-12 px-8 font-sans text-xs tracking-widest uppercase bg-accent-gold/90 text-luxury-base hover:bg-accent-gold disabled:opacity-50"
      >
        {saving ? "Сохранение…" : "Сохранить настройки"}
      </button>
    </form>
  );
}
