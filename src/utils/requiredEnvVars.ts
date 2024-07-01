import { parse } from "envfile";
import fs from "fs";

export const checkRequiredEnvVars = (vars: {}) => {
  let checkResult = true;
  const varsWithError: string[] = [];
  vars;
  const exampleEnvContent = fs.readFileSync(".example.env").toString();

  // Read example.env file
  const exampleEnv: {} = parse(exampleEnvContent);
  const exampleEnvKeys = Object.keys(exampleEnv);
  const exampleEnvValues = Object.values(exampleEnv);
  const actualEnvKeys = Object.keys(vars);
  const actualEnvValues = Object.keys(vars);

  exampleEnvKeys.map((exampleKey, idx) => {
    if (!actualEnvKeys.includes(exampleKey)) {
      checkResult = false;
      varsWithError.push(exampleKey);
    }
    const actualValueIdx = actualEnvKeys.indexOf(exampleKey);
    if (exampleEnvValues[idx] && !actualEnvValues[actualValueIdx]) {
      checkResult = false;
      varsWithError.push(exampleKey);
    }
  });
  const errorVarsSet = [...new Set(varsWithError)];
  if (!checkResult) throw new Error(`Configuration error: Missing required environment variables(${errorVarsSet.join(", ")}).`);

  return checkResult;
};
