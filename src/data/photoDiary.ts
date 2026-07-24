export interface DiaryEntry {
  day: string;
  caption: string;
  palette: [string, string, string];
}

export interface DiaryMonth {
  slug: string;
  month: string;
  year: string;
  subtitle: string;
  coverPalette: [string, string, string];
  entries: DiaryEntry[];
}

export const diaryMonths: DiaryMonth[] = [
  {
    slug: "july-2026",
    month: "July",
    year: "2026",
    subtitle: "One image a day. A month held still for a second.",
    coverPalette: ["#3d4f63", "#d9b391", "#f1e5d0"],
    entries: [
      { day: "01", caption: "empty platform hums\nmorning keeps its blue distance\nrails remember rain", palette: ["#2f4359", "#7b91a8", "#d7d2cb"] },
      { day: "02", caption: "coffee losing steam\nhalf a page of second thoughts\nwindow full of light", palette: ["#4b3528", "#ad8f72", "#e9dccd"] },
      { day: "03", caption: "soft concrete noon sky\nbuildings flatten into dust\nheat edits the street", palette: ["#51697b", "#b6c2c9", "#efebe4"] },
      { day: "04", caption: "red rail in sunset\nholding the last sharp colour\nwhile the day lets go", palette: ["#6c2b2f", "#d66f56", "#f2d4bf"] },
      { day: "05", caption: "museum glass smudged\norder borrowed for an hour\nsilence wears a frame", palette: ["#37424b", "#8ea1ae", "#d9d9d5"] },
      { day: "06", caption: "pavement in white heat\nsilver climbs across the curb\nair forgets to move", palette: ["#5c6156", "#bbb693", "#ede4c9"] },
      { day: "07", caption: "window left ajar\nsummer folds into the room\ncurtain learns to drift", palette: ["#243141", "#8a9db1", "#ddd7cf"] },
      { day: "08", caption: "plate in evening light\nan ordinary good meal\ntrying does not show", palette: ["#624736", "#c38b58", "#f0dbc0"] },
      { day: "09", caption: "rain on brick again\ncity made of darker reds\nwater finds the lines", palette: ["#2b323a", "#73808d", "#cfcac4"] },
      { day: "10", caption: "yellow chair alone\nbright against the serious room\njoy without a speech", palette: ["#68582d", "#d1b45a", "#f2ebd2"] },
      { day: "11", caption: "dusk cuts paper shapes\nrooftops lose their confidence\nsky keeps the outline", palette: ["#2d3550", "#7f8aac", "#dad8e3"] },
      { day: "12", caption: "sunday table waits\nnewsprint folded out of time\nnothing asks to rush", palette: ["#56453e", "#b99f91", "#f1e9df"] }
    ]
  }
];
