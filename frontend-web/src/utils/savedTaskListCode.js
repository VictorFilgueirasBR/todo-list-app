// src/utils/savedTaskListCode.js
// Importa o conteúdo do arquivo SavedTaskList.js como uma string


/* eslint-disable import/no-webpack-loader-syntax */
import savedTaskListRawCode from '!!raw-loader!../components/SavedTaskList.js';
/* eslint-enable import/no-webpack-loader-syntax */

export default savedTaskListRawCode;