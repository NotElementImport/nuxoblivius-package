export const __me = {};
export const morph = (a, b, time = 2, options = {}) => {
    const hideA = 'hide' in options ? options['hide'] : true;
    const reverse = 'reverse' in options ? options['reverse'] : false;
    const original = __me[a];
    const firstObject = __me[a + '_morph'];
    const secondObject = __me[b];
    if (firstObject == null) {
        console.error(`object a is not finded tag: ${a}`);
    }
    else if (secondObject == null) {
        console.error(`object b is not finded tag: ${b}`);
    }
    if (original.style.visibility == 'hidden') {
        return;
    }
    let boxA = original.getBoundingClientRect();
    let currentA = [boxA.left, boxA.top, boxA.width, boxA.height];
    let boxB = secondObject.getBoundingClientRect();
    let calc = [boxB.left - boxA.left, boxB.top - boxA.top, boxB.width - boxA.width, boxB.height - boxA.height];
    original.before(firstObject);
    if (hideA) {
        original.style.visibility = 'hidden';
    }
    firstObject.style.position = 'fixed';
    firstObject.style.transition = 'fixed';
    firstObject.style.overflow = 'hidden';
    firstObject.style.display = 'block !important';
    firstObject.classList.remove('morph');
    let _timer = 0;
    let oldTime = Date.now();
    const updateLogic = () => {
        let currentTime = Date.now();
        _timer += currentTime / oldTime * 0.05 * (1 / Math.pow(time, 1.5));
        let smooth = Math.sin(_timer * Math.PI * 0.5);
        firstObject.style.top = `${currentA[1] + (calc[1] * (reverse ? 1 - smooth : smooth))}px`;
        firstObject.style.width = `${currentA[2] + (calc[2] * (reverse ? 1 - smooth : smooth))}px`;
        firstObject.style.left = `${currentA[0] + (calc[0] * (reverse ? 1 - smooth : smooth))}px`;
        firstObject.style.height = `${currentA[3] + (calc[3] * (reverse ? 1 - smooth : smooth))}px`;
        oldTime = currentTime;
        if (_timer > 1) {
            firstObject.style.display = 'none';
            firstObject.classList.add('morph');
        }
        else {
            requestAnimationFrame(updateLogic);
        }
    };
    requestAnimationFrame(updateLogic);
};
export const after = (a, b, time = 2) => {
    /** @type {HTMLElement} */
    const original = __me[a];
    /** @type {HTMLElement} */
    const firstObject = __me[a + '_morph'];
    /** @type {HTMLElement} */
    const secondObject = __me[b];
    if (firstObject == null) {
        console.error(`object a is not finded tag: ${a}`);
    }
    else if (secondObject == null) {
        console.error(`object b is not finded tag: ${b}`);
    }
    /** @type {HTMLElement} */
    let copyOrginial = original.parentNode.cloneNode(true);
    secondObject.after(copyOrginial);
    let boxA = original.getBoundingClientRect();
    let boxAP = original.parentElement.getBoundingClientRect();
    let currentA = [boxA.left, boxA.top, boxA.width, boxA.height];
    let boxB = copyOrginial.getBoundingClientRect();
    let boxC = copyOrginial.children[0].getBoundingClientRect();
    let calc = [boxC.left - boxA.left, boxC.top - boxA.top, boxC.width - boxA.width, boxC.height - boxA.height];
    copyOrginial.style.width = '0px';
    copyOrginial.style.height = '0px';
    copyOrginial.style.visibility = 'hidden';
    original.before(firstObject);
    original.style.display = 'none';
    firstObject.style.position = 'fixed';
    firstObject.style.transition = 'fixed';
    firstObject.style.overflow = 'hidden';
    firstObject.style.display = 'block !important';
    firstObject.classList.remove('morph');
    original.parentElement.style.overflow = 'hidden';
    let _timer = 0;
    let oldTime = Date.now();
    const clamp = (a) => {
        if (a < 0)
            return 0;
        else if (a > 1)
            return 1;
        return a;
    };
    const updateLogic = () => {
        let currentTime = Date.now();
        _timer += currentTime / oldTime * 0.05 * (1 / Math.pow(time, 1.5));
        let smooth = Math.sin(clamp(_timer + 0.2 * 0.6) * Math.PI * 0.5);
        let appearSmooth = Math.sin(clamp(_timer - 0.8 * 0.2) * Math.PI * 0.5);
        let disappearSmooth = 1 - Math.sin(clamp(_timer * 1.8) * Math.PI * 0.5);
        firstObject.style.top = `${currentA[1] + (calc[1] * smooth) + boxAP.height * disappearSmooth}px`;
        firstObject.style.width = `${currentA[2] + (calc[2] * smooth)}px`;
        firstObject.style.left = `${currentA[0] + (calc[0] * smooth)}px`;
        firstObject.style.height = `${currentA[3] + (calc[3] * smooth)}px`;
        copyOrginial.style.width = `${boxB.width * appearSmooth}px`;
        copyOrginial.style.height = `${boxB.height * appearSmooth}px`;
        original.parentElement.style.width = `${boxAP.width * disappearSmooth}px`;
        original.parentElement.style.height = `${boxAP.height * disappearSmooth}px`;
        oldTime = currentTime;
        console.log(disappearSmooth);
        if (_timer > 1) {
            firstObject.style.display = 'none';
            firstObject.classList.add('morph');
            original.style.removeProperty('visibility');
            original.style.removeProperty('display');
            original.parentElement.style.removeProperty('width');
            original.parentElement.style.removeProperty('height');
            original.parentElement.style.removeProperty('overflow');
            copyOrginial.remove();
            secondObject.after(original.parentNode);
            original.appendChild(firstObject);
        }
        else {
            requestAnimationFrame(updateLogic);
        }
    };
    requestAnimationFrame(updateLogic);
};
export const reset = (tag) => {
    const original = __me[tag];
    original.style.removeProperty('visibility');
};
