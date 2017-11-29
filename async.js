'use strict';

exports.isStar = false;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @returns {Promise}
 */
function runParallel(jobs, parallelNum) {
    let i = parallelNum;
    let dividedArray = [];
    let resArray = [];
    while (i <= jobs.length) {
        dividedArray.push(jobs.slice(i - parallelNum, i));
        i += parallelNum;
    }
    let resPromise = Promise.resolve([]);
    dividedArray.forEach(parallelActions => {
        resPromise = resPromise.then(function (prevData) {
            if (prevData.length) {
                resArray.push(prevData);
            }

            return Promise.all(parallelActions.map(catchError))
                .catch(function (error) {
                    resArray.push(error);

                    return error;
                });
        });
    });

    return resPromise.then(function (prevData) {
        resArray.push(prevData);

        return Promise.resolve([].concat(...resArray));
    });
    function makePromise(action) {
        return new Promise(function (res) {
            try {
                let result = action();
                res(result);
            } catch (e) {
                res(e);
            }
        });
    }
    function catchError(action) {
        return Promise.resolve(makePromise(action)).catch(function (error) {
            return error;
        });
    }
}

