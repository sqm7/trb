
export const getDateRangeDates = (rangeType: string) => {
    const end = new Date();
    let start = new Date();

    switch (rangeType) {
        case '1q':
            start.setMonth(end.getMonth() - 3);
            break;
        case '2q':
            start.setMonth(end.getMonth() - 6);
            break;
        case '3q':
            start.setMonth(end.getMonth() - 9);
            break;
        case '1y':
            start.setFullYear(end.getFullYear() - 1);
            break;
        case 'this_year':
            start = new Date(end.getFullYear(), 0, 1);
            break;
        case 'last_2_years':
            start = new Date(end.getFullYear() - 1, 0, 1);
            break;
        case 'last_3_years':
            start = new Date(end.getFullYear() - 2, 0, 1);
            break;
        default:
            return { startDate: '', endDate: '' };
    }

    return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
    };
};
