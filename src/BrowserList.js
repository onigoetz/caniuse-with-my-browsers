import React from "react";
import { Badge } from "reactstrap";

import { agents } from "caniuse-db/fulldata-json/data-2.0.json";

function getBrowserName(family) {
  return agents[family].browser || family;
}

export default function BrowserList({ browsers }) {
  const finalBrowsers = [];
  const grouped = {};

  browsers.forEach(browser => {
    const [family, version] = browser.split(" ");

    if (!grouped[family]) {
      grouped[family] = [];
    }

    grouped[family].push(version);
  });

  Object.keys(grouped).forEach(family => {
    let startRange, lastRangeItem, addedRaw;
    grouped[family]
      .map(rawVersion => {
        const version = parseInt(rawVersion, 10);
        return version == rawVersion ? version : rawVersion;
      })
      .sort();

    for (const rawVersion of grouped[family]) {
      const version = parseInt(rawVersion, 10);

      addedRaw = false;
      if (version != rawVersion) {
        finalBrowsers.push(`${getBrowserName(family)} ${rawVersion}`);
        addedRaw = true;
        startRange = null;
        lastRangeItem = null;
        continue;
      }

      if (!startRange) {
        startRange = version;
      }

      if (!lastRangeItem) {
        lastRangeItem = version;
      }

      if (parseInt(version, 10) > lastRangeItem + 1) {
        if (startRange === lastRangeItem) {
          finalBrowsers.push(`${getBrowserName(family)} ${startRange}`);
        } else {
          finalBrowsers.push(
            `${getBrowserName(family)} ${startRange} → ${lastRangeItem}`
          );
        }
        startRange = version;
      }

      lastRangeItem = version;
    }

    // Add the last one
    if (!addedRaw) {
      if (startRange === lastRangeItem) {
        finalBrowsers.push(`${getBrowserName(family)} ${startRange}`);
      } else {
        finalBrowsers.push(
          `${getBrowserName(family)} ${startRange} → ${lastRangeItem}`
        );
      }
    }
  });

  return finalBrowsers.map(browser => (
    <>
      <Badge key={browser}>{browser}</Badge>{" "}
    </>
  ));
}
