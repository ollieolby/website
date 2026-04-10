---
title: "Arduino TFL arrival board"
description: "Building a homemade board to decide which District line station gets me eastbound fastest."
date: 2026-03-29
author: "Ollie Olby"
tags: ["arduino", "transport", "python"]
featured: true
---

Let me start by outlining a problem I had. I live in a slightly unusual part of London. I am roughly equidistant from two District line stations, but they sit on different branches that later merge eastbound. In practice that means every time I leave the house heading east, I need to work out which station gets me there fastest.

That usually meant walking down the road with my phone out, refreshing directions and trying to guess which option was genuinely quicker. It is a small problem, but it also felt like a very solvable one, so I decided to build my own arrival board with an Arduino.

My solution was to pull live arrivals from TfL, process the response, and send a compact summary to a small LCD display.

## Reading the TfL API

TfL has a great free API, so the first step was understanding the arrival payload.

```python
import requests

url = "https://api.tfl.gov.uk/line/district/arrivals"

try:
    response = requests.get(url)
    response.raise_for_status()
except requests.exceptions.HTTPError as http_err:
    print(f"HTTP error occurred: {http_err}")
except Exception as err:
    print(f"Other error occurred: {err}")
else:
    data = response.json()

print(data[0])
```

That response includes fields like `currentLocation`, `platformName`, `destinationName`, and `expectedArrival`, which are exactly what I needed.

## Filtering to the stations I care about

Once the raw payload made sense, the next step was to filter down to the two stations I actually use and sort by arrival time.

```python
import pandas as pd

selected_fields = [
    "vehicleId",
    "stationName",
    "lineName",
    "platformName",
    "expectedArrival",
    "towards",
]

table_data = [{field: item[field] for field in selected_fields} for item in data]
df = pd.DataFrame(table_data)

df["expectedArrival"] = pd.to_datetime(df["expectedArrival"])

stations_of_interest = [
    "Gunnersbury Underground Station",
    "Chiswick Park Underground Station",
]

df_filtered = df[df["stationName"].isin(stations_of_interest)]
print(df_filtered)
```

At that point I had the core information I needed: which station, which direction, and when the next train would arrive.

## Sorting eastbound and westbound

The arrival board works best when trains are grouped by direction and then sorted by time.

```python
df_filtered["is_eastbound"] = df_filtered["platformName"].str.contains(
    "Eastbound", case=False
)

df_sorted = df_filtered.sort_values(
    by=["is_eastbound", "expectedArrival"],
    ascending=[False, True]
)

df_sorted = df_sorted.drop(columns="is_eastbound")

df_sorted.loc[
    df_sorted["stationName"] == "Gunnersbury Underground Station", "stationName"
] = "Gunnersbury"

df_sorted.loc[
    df_sorted["stationName"] == "Chiswick Park Underground Station", "stationName"
] = "Chiswick Park"
```

Now I had a list in the exact order I wanted to show on the display.

## Converting the data for the LCD

The next part was serialising the information into a simple format an Arduino could parse easily. I used commas to separate left and right alignment, and pipes to mark line breaks.

```python
from datetime import datetime
import pytz

def send_to_lcd(df):
    current_time = datetime.now(pytz.utc)
    lines_to_display = []
    lines_to_display.append("EASTBOUND,")
    show = True
    count = 1

    for _, row in df.iterrows():
        if show and "Westbound" in row["platformName"]:
            show = False
            lines_to_display.append("WESTBOUND,")
            count = 1

        station = row["stationName"]
        arrival_time = row["expectedArrival"]
        minutes_until = round((arrival_time - current_time).total_seconds() / 60)

        if minutes_until > 0:
            display_line = f"{count} {station[:14]},{minutes_until}min"
            lines_to_display.append(display_line)
            count += 1

    message = "|".join(lines_to_display)[:200] + "\n"
    print(message)

send_to_lcd(df_sorted)
```

That gave me a compact message which could be sent straight over serial to the display.

## Driving the Arduino screen

On the Arduino side, I used an Adafruit display and a London Underground inspired font. The display waits for newline-terminated serial input, then redraws the board.

The typeface came from [this London Underground dot matrix project](https://github.com/petykowski/London-Underground-Dot-Matrix-Typeface), and I converted it for the [Adafruit GFX library](https://github.com/adafruit/Adafruit-GFX-Library).

```cpp
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>

#include "LondonUnderground12pt7b.h"

#define TFT_CS 10
#define TFT_RST 9
#define TFT_DC 8

Adafruit_ILI9341 tft = Adafruit_ILI9341(TFT_CS, TFT_DC, TFT_RST);

String incomingData = "";

void setup() {
  Serial.begin(9600);
  tft.begin();
  tft.setRotation(3);
  tft.setFont(&LondonUndergroundRegular8pt7b);
  tft.fillScreen(ILI9341_BLACK);
  tft.setTextColor(ILI9341_WHITE);
  tft.setTextSize(1);
  tft.setCursor(10, 18);
  tft.println("Waiting for data...");
}

void loop() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\n') {
      displayData(incomingData);
      incomingData = "";
    } else {
      incomingData += c;
    }
  }
}
```

## Next steps

The software side got me to a good place: pull the data, rank the useful trains, and package it for the screen.

The next steps are mostly hardware:

- finish wiring the LCD neatly
- write the display drawing function in the Arduino sketch
- package the whole thing into something that can sit by the door and update reliably

It started as a tiny annoyance, but it turned into exactly the kind of project I like: a real everyday problem, a small piece of code, and a weirdly satisfying physical output.
