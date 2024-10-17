const charTable = 'qwertyuiopasdfghjklzxcvbnm1234567890@$&'

export const hash = () => {
    let res = ''
    for(let i = 0; i < 10; i++)
        res += charTable.charAt(
            Math.round(Math.random() * (charTable.length - 1))
        );
    return res
}