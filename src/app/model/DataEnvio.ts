/**
 * O backend serializa datas com offset com dois pontos (-03:00) e le o mesmo formato.
 * Converte 'yyyy-MM-dd' (input type="date") em 'yyyy-MM-ddT00:00:00-03:00'; outros valores passam como estao.
 */
export function paraIsoComOffset(valor: any): any {
    if (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        return valor + 'T00:00:00-03:00';
    }
    return valor;
}
