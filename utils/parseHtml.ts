import { IOptionData } from "@/types/IOptionData";
import { PrayerTimesByDay } from "@/types/PrayerTimes";
import { DomUtils, parseDocument } from "htmlparser2";

export async function parseCities(html: string): Promise<IOptionData[]> {
  const dom = parseDocument(html);
  const selectElement = DomUtils.findOne(
    (elem) =>
      elem.type === "tag" &&
      elem.name === "select" &&
      elem.attribs.id === "ifis_bonetider_page_cities",
    dom.children
  );

  if (!selectElement) {
    return [];
  }

  const options = DomUtils.findAll(
    (elem) => elem.type === "tag" && elem.name === "option",
    selectElement.children
  );

  const result = options.map<IOptionData>((option) => ({
    value: option.attribs.value || "",
    label: DomUtils.textContent(option).trim(),
  }));

  return result;
}

export async function parseIslamiskaForbundentPrayerTimes(
  html: string
): Promise<PrayerTimesByDay> {
  const dom = parseDocument(html);
  const tbody = DomUtils.findOne(
    (elem) =>
      elem.type === "tag" &&
      elem.name === "tbody" &&
      elem.attribs.id === "ifis_bonetider",
    dom.children
  );

  if (!tbody) {
    return {};
  }

  const rows = DomUtils.findAll(
    (elem) => elem.type === "tag" && elem.name === "tr",
    tbody.children
  );

  const result: PrayerTimesByDay = {};
  rows.forEach((row) => {
    const cells = DomUtils.findAll(
      (elem) => elem.type === "tag" && elem.name === "td",
      row.children
    );

    if (cells.length === 7) {
      const day = parseInt(DomUtils.textContent(cells[0]), 10);

      result[day] = {
        fajr: DomUtils.textContent(cells[1]).trim(),
        shuruk: DomUtils.textContent(cells[2]).trim(),
        dhuhr: DomUtils.textContent(cells[3]).trim(),
        asr: DomUtils.textContent(cells[4]).trim(),
        maghrib: DomUtils.textContent(cells[5]).trim(),
        isha: DomUtils.textContent(cells[6]).trim(),
      };
    }
  });

  return result;
}
