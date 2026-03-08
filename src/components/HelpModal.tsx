import React from 'react';
import { X, BookOpen } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              VCE Pseudocode Conventions
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Program Structure
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm">
                <div className="text-gray-800 dark:text-gray-200">
                  BEGIN<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;{/* program statements */}<br />
                  END
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Every program must start with BEGIN and end with END.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Assignment
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm">
                <div className="text-gray-800 dark:text-gray-200">
                  variable ← value<br />
                  count ← 0<br />
                  name ← "John"
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Use the ← symbol for assignment (not =).
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Input and Output
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm">
                <div className="text-gray-800 dark:text-gray-200">
                  INPUT variable<br />
                  OUTPUT value<br />
                  OUTPUT "Hello, World!"
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Selection (IF-THEN-ELSE)
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm">
                <div className="text-gray-800 dark:text-gray-200">
                  IF condition THEN<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;statements<br />
                  ELSE IF condition THEN<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;statements<br />
                  ELSE<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;statements<br />
                  END IF
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Iteration (Loops)
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">FOR Loop:</p>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm">
                    <div className="text-gray-800 dark:text-gray-200">
                      FOR variable FROM start TO end<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;statements<br />
                      END FOR
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">WHILE Loop:</p>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm">
                    <div className="text-gray-800 dark:text-gray-200">
                      WHILE condition<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;statements<br />
                      END WHILE
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Functions
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm">
                <div className="text-gray-800 dark:text-gray-200">
                  DEFINE functionName(parameter1, parameter2)<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;statements<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;RETURN value
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Operators
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Arithmetic:</p>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400 font-mono text-sm">
                    <li>+ (addition)</li>
                    <li>- (subtraction)</li>
                    <li>× (multiplication)</li>
                    <li>/ (division)</li>
                    <li>MOD (modulo)</li>
                  </ul>
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Comparison:</p>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400 font-mono text-sm">
                    <li>= (equal to)</li>
                    <li>≠ (not equal to)</li>
                    <li>&lt; (less than)</li>
                    <li>&gt; (greater than)</li>
                    <li>≤ (less than or equal)</li>
                    <li>≥ (greater than or equal)</li>
                  </ul>
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Logical:</p>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400 font-mono text-sm">
                    <li>AND</li>
                    <li>OR</li>
                    <li>NOT</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                How to Use This Editor
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Click on reserved word buttons to insert them at the cursor position</li>
                <li>• Reserved words are automatically capitalized</li>
                <li>• Use Templates dropdown to load common algorithm patterns</li>
                <li>• Convert your pseudocode to Python or JavaScript</li>
                <li>• Import existing Python/JavaScript code to convert to pseudocode</li>
                <li>• Download your work as .py, .js, or PDF files</li>
              </ul>
            </section>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
