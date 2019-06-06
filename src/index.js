import React from "react";
import ReactDOM from "react-dom";

import browserslist from "browserslist";

import { Card, CardText, CardBody, CardTitle, Badge, Input } from "reactstrap";
import ReactMarkdown from "react-markdown";

import Popover, { ArrowContainer } from "react-tiny-popover";

import BrowserList from "./BrowserList";

import { data } from "caniuse-db/fulldata-json/data-2.0.json";

import "bootstrap/dist/css/bootstrap.css";
import "./styles.css";

function getFeature(feature) {
  return data[feature];
}

// 2016 Review
const oldDefault = [
  "> 0.25%",
  "Firefox ESR",
  "Edge >= 13",
  "Safari >= 7.1",
  "iOS >= 7.1",
  "Chrome >= 32",
  "Firefox >= 24",
  "Opera >= 24",
  "IE >= 9",
  "not op_mini all"
].join(", ");

// 2019 Review
const defaultBrowsers = [
  "> 0.25%",
  "Edge >= 15",
  "Safari >= 10",
  "iOS >= 10",
  "Chrome >= 56",
  "Firefox >= 51",
  "IE >= 11",
  "not op_mini all"
].join(", ");

function App({ defaultBrowsers, caniuseData }) {
  const [chosenBrowsers, setBrowser] = React.useState(defaultBrowsers);
  const [filteredFeature, setFeature] = React.useState("");

  let browsers;
  try {
    browsers = browserslist(chosenBrowsers);
  } catch (e) {
    browsers = [];
  }

  const filteredFeatures = Object.keys(caniuseData).filter(feature => {
    if (filteredFeature === "") {
      return true;
    }

    // TODO :: improve search to include title and keywords

    return feature.indexOf(filteredFeature) > -1;
  });

  return (
    <div className="App">
      <h1>Caniuse Next gen</h1>
      <h2>Choose your browser list</h2>
      <Input
        value={chosenBrowsers}
        onChange={event => setBrowser(event.target.value)}
      />
      <p>
        <strong>
          {browsers.length} Browsers,{" "}
          {browserslist.coverage(browsers).toFixed(2)}% coverage
        </strong>
        <br />
        <BrowserList browsers={browsers} />
      </p>

      <h2>Check your feature</h2>
      <Input
        placeholder="Filter by feature..."
        value={filteredFeature}
        onChange={event => setFeature(event.target.value)}
      />

      <p>
        <strong>{filteredFeatures.length} Features</strong>
      </p>

      {filteredFeatures.slice(0, 10).map(feature => (
        <Feature key={feature} browsers={browsers} feature={feature} />
      ))}
    </div>
  );
}

function isSupported(feature, fullBrowser) {
  const [browser, version] = fullBrowser.split(" ");

  return feature.stats[browser][version];
}

const firstLetter = {
  // YES
  y: "Supported",

  // Partial
  a: "Partial",
  p: "Polyfillable",
  // x : needs prefix

  // NO
  n: "Unsupported",
  u: "Unknown"
  // d : behind a flag
};

const flags = {
  x: "Needs Prefix",
  d: "Behind a flag"
};

function Support({ status, browsers, data }) {
  const [isOpen, setPopupState] = React.useState(false);

  const togglePopup = () => setPopupState(!isOpen);

  return (
    <Popover
      isOpen={isOpen}
      position={["right", "top"]} // if you'd like, supply an array of preferred positions ordered by priority
      padding={10} // adjust padding here!
      onClickOutside={togglePopup} // handle click events outside of the popover/target here!
      disableReposition // prevents automatic readjustment of content position that keeps your popover content within your window's bounds
      content={({ position, targetRect, popoverRect }) => (
        <ArrowContainer // if you'd like an arrow, you can import the ArrowContainer!
          position={position}
          targetRect={targetRect}
          popoverRect={popoverRect}
          arrowColor={"#ddd"}
          arrowSize={10}
        >
          <div className="Popup">
            <BrowserList browsers={browsers.browsers} />
          </div>
        </ArrowContainer>
      )}
    >
      <div className={`Support Support-${status}`} onClick={togglePopup}>
        <h4>{firstLetter[status]}</h4>{" "}
        <p>
          {Object.keys(browsers.flags).map(flag => (
            <Badge>{flags[flag]}</Badge>
          ))}{" "}
          {Object.keys(browsers.notes).map(note => (
            <Badge>#{note}</Badge>
          ))}
        </p>
        ({browsers.browsers.length} browsers,{" "}
        {browserslist.coverage(browsers.browsers).toFixed(2)}%)
      </div>
    </Popover>
  );
}

function Feature({ feature, browsers }) {
  const data = getFeature(feature);

  /*
  "title", "description", "spec", "status", 
  "links", "categories", "stats", "notes", 
  "notes_by_num", "usage_perc_y", "usage_perc_a", 
  "ucprefix", "parent", "keywords", "ie_id", 
  "chrome_id", "firefox_id", "webkit_id"
  */

  const status = {};
  const notes = {};

  browsers.forEach(browser => {
    const [category, ...flags] = isSupported(data, browser).split(" ");

    if (!status[category]) {
      status[category] = { browsers: [], flags: {}, notes: {} };
    }

    flags.forEach(flag => {
      if (flag[0] === "#") {
        const note = flag.substr(1);
        status[category].notes[note] = note;
        notes[note] = data.notes_by_num[note];
      } else {
        status[category].flags[flag] = flag;
      }
    });

    status[category].browsers.push(browser);
  });

  return (
    <Card>
      <CardBody>
        <CardTitle>
          {data.title} <code>{feature}</code>
        </CardTitle>
        <CardText>
          <small>
            <ReactMarkdown source={data.description} />
          </small>
        </CardText>
        <div>
          {Object.keys(status).map(stat => (
            <Support status={stat} browsers={status[stat]} data={data} />
          ))}
        </div>

        <ul>
          {Object.keys(notes).map(note => (
            <li>
              <ReactMarkdown source={`__#${note}__ ${notes[note]}`} />
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(
  <App caniuseData={data} defaultBrowsers={defaultBrowsers} />,
  rootElement
);
