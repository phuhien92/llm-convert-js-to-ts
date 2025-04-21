import { createInterface } from 'readline';

export const program = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

export const getInput = (question: string): Promise<string> => {
  return new Promise((resolve) => {
      program.question(question, (answer) => {
        resolve(answer);
      });
  });
};

export const closeReadline = () => {
  program.close();
};

export const collectInputs = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const siblingTestFilesSourceCode = await getInput(
        "Enter the source code of sibling tests:\n"
      );

      const reactTestingLibraryExamples = await getInput(
        "Enter React Testing Library examples:\n"
      );

      const nearestImportSourceCode = await getInput(
        "Enter the nearest import source code:\n"
      );

      const componentFileSourceCode = await getInput(
        "Enter the component source code:\n"
      );

      const testFileSourceCode = await getInput(
        "Enter the test file source code to migrate:\n"
      );

      const prompt = [
        "Convert this Enzyme test to React Testing Library:",
        `SIBLING TESTS:\n${siblingTestFilesSourceCode}`,
        `RTL EXAMPLES:\n${reactTestingLibraryExamples}`,
        `IMPORTS:\n${nearestImportSourceCode}`,
        `COMPONENT SOURCE:\n${componentFileSourceCode}`,
        `TEST TO MIGRATE:\n${testFileSourceCode}`,
      ].join("\n\n");

      resolve(prompt);
    } catch (error) {
      console.error("Error collecting inputs:", error);
      closeReadline();
      reject(error);
    }
  });
}
