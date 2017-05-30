export type Rules = {
    [key: string]: string | RegExp
};

export type Triplet = {
    formula: string,
    marker: string,
    rule: string,
    quantifier: string,
    repeating: boolean,
    empty: boolean
}
