'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout
 * @returns {Promise}
 */
function runParallel(jobs, parallelNum, timeout = 1000) {
    let actions = [...jobs];
    let result = [];
    let nextIndex = parallelNum;
    let startJobs = actions.splice(0, parallelNum);
    let completed = 0;

    return new Promise(function (resolve) {
        startJobs.forEach(function (job, i) {
            makePromise(preparePromise(job), i, resolve);
        });
    });

    function preparePromise(job) {
        return new Promise(function (res, rej) {
            job().then(res)
                .catch(rej);
            setTimeout(function () {
                rej(new Error('Promise timeout'));
            }, timeout);
        });
    }
    function makePromise(promise, index, initCallback) {
        promise.then(writePromiseResult.bind(null, index, initCallback))
            .catch(writePromiseResult.bind(null, index, initCallback));
    }
    function writePromiseResult(index, initCallback, data) {
        result[index] = data;
        if (jobs.length === ++completed) {
            initCallback(result);

            return;
        }
        if (nextIndex < jobs.length) {
            makePromise(preparePromise(actions.shift()), nextIndex++, initCallback);
        }
    }
}
