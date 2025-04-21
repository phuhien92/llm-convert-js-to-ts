import { ChromaClient } from "chromadb";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import jest from "jest";
export const client = new ChromaClient({ path: "http://localhost:8000" });

export const collection = await client.getOrCreateCollection({
  name: "llm-js-to-ts",
});

export function generateContentHash(content) {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

export const exclusionList = [
  "node_modules",
];
export const isJSFile = (entry) => {
  return entry.isFile() && [".js", ".jsx"].includes(path.extname(entry.name));
};

// run jest command and return the json output
export const runJest = async (testFilePath) : Promise<any>  => {
  const jestConfig: any = {
    testPathPattern: testFilePath,
    json: true,
    outputFile: path.join(__dirname, "jest-output.json"),
    silent: true,
    collectCoverage: false,
    testTimeout: 10000,
  };  
  return new Promise((resolve, reject) => {
    jest.runCLI(jestConfig, [testFilePath]).then((result) => {
      if (result.results.success) {
        resolve(result.results);
      } else {
        reject(new Error("Jest test failed"));
      }
    }).catch((error) => {
      reject(error);
    });
  });
}

export async function convertJSFileToTS({ entry, srcPath, dest }) {
  return new Promise(async (resolve, reject) => {
    console.log(`1. Converting ${entry.name} to TypeScript...`);

    const jsCode = fs.readFileSync(srcPath, "utf8");
    const tsCode = await collection.query({
      queryTexts: jsCode,
      nResults: 1,
    });

    if (!tsCode || typeof tsCode !== 'string') return console.error(`Failed to convert ${entry.name} to TypeScript`);
    const tsFilePath = path.join(dest, entry.name.replace(/\.js/, ".ts"));
    fs.writeFileSync(tsFilePath, tsCode, "utf8");
    console.log(` => Converted ${entry.name} to TypeScript`);
    
    console.log(`2. Running Jest tests on ${tsFilePath}...`);
    const testResults = await runJest(tsFilePath);
    if (testResults.success) {
      console.log(` => Jest tests passed for ${tsFilePath}`);
      resolve(testResults); 
    }

    console.log(` => Jest tests failed for ${tsFilePath}`);
    reject(new Error(`Jest tests failed for ${tsFilePath}`));
  })
}

export function copyDirectory(src: string, dest: string) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (exclusionList.includes(entry.name)) {
        continue;
      }
      return copyDirectory(srcPath, destPath);
    }

    if (isJSFile(entry)) {
      return convertJSFileToTS({ entry, srcPath, dest }).then(() => {
        return;
      })
    }
    // other file types: copy them as is
    return fs.copyFileSync(srcPath, destPath);
  }
}