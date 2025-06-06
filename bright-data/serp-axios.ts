import * as dotenv from "dotenv";
dotenv.config();

import axios from "axios";

async function serpBrightData(query: string) {
  const BRIGHT_DATA_API_KEY = process.env.BRIGHT_DATA_API_KEY;
  if (!BRIGHT_DATA_API_KEY) {
    throw new BrightDataError(
      BrightDataErrorMessage.BRIGHT_DATA_API_KEY_MISSING
    );
  }

  const BRIGHT_DATA_ZONE_SERP = process.env.BRIGHT_DATA_ZONE_SERP;
  if (!BRIGHT_DATA_ZONE_SERP) {
    throw new BrightDataError(
      BrightDataErrorMessage.BRIGHT_DATA_ZONE_SERP_MISSING
    );
  }

  // Assume it is a daily briefing, so we set `tbs` to `qdr:d` to only search results in the past 24 hours.
  const url_target = `https://www.google.com/search?q=${encodeQuery(
    query
  )}&tbs=qdr:d&brd_json=1`;

  const url = "https://api.brightdata.com/request";

  const headers = {
    Authorization: `Bearer ${BRIGHT_DATA_API_KEY}`,
    "Content-Type": "application/json",
  };

  const data = {
    zone: BRIGHT_DATA_ZONE_SERP,
    url: url_target,
    format: "json",
  };

  try {
    const response = await axios.post(url, data, { headers });
    return JSON.parse(response.data.body);
  } catch (error) {
    if (error.status === 401) {
      throw new BrightDataError(BrightDataErrorMessage.AUTHENTICATION_FAILED);
    }

    if (error instanceof SyntaxError) {
      throw new BrightDataError(BrightDataErrorMessage.NOT_VALID_JSON);
    }

    throw new BrightDataError(BrightDataErrorMessage.UNKNOWN_ERROR);
  }
}

function encodeQuery(query: string) {
  return query.replace(/\s+/g, "+");
}

class BrightDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

enum BrightDataErrorMessage {
  BRIGHT_DATA_API_KEY_MISSING = "API key is missing",
  BRIGHT_DATA_ZONE_SERP_MISSING = "Zone for SERP is missing",
  AUTHENTICATION_FAILED = "Authentication failed",
  NOT_VALID_JSON = "Response is not a valid JSON string",
  // The following are the undistinguishable known cases:
  // * Zone not found: 400 - error.response.data === `zone "serp" not found`
  // * Google search URL is not valid: 400
  UNKNOWN_ERROR = "Unknown error",
}

serpBrightData("elon musk");
