export const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
};

export const generateAccountNo = async ({ schemaName }) => {
    let finalAccountNo;
    let isAccountExists = true;

    while (isAccountExists) {
        const currentDate = new Date();

        const yyyy = currentDate.getFullYear();

        const mm = String(currentDate.getMonth() + 1).padStart(2, "0");

        const dd = String(currentDate.getDate()).padStart(2, "0");

        const randomNumber = String(
            Math.floor(1000 + Math.random() * 9000)
        );

        finalAccountNo = `${yyyy}${mm}${dd}${randomNumber}`;

        const existingAccount = await schemaName.findOne({
            acountNo: finalAccountNo,
        });

        if (!existingAccount) {
            isAccountExists = false;
        }
    }

    return finalAccountNo;
};

export const generateMemberId = async ({ schemaName }) => {
    let memberId;
    let isMemberIdExists = true;

    while (isMemberIdExists) {
        memberId = String(
            Math.floor(1000 + Math.random() * 9000)
        );

        const existingMemberId = await schemaName.findOne({
            memberId,
        });

        if (!existingMemberId) {
            isMemberIdExists = false;
        }
    }

    return memberId;
};


export const generateUniqueId = async ({
    schemaName,
    prefix = "OR",
}) => {
    let uniqueId;
    let isUniqueIdExists = true;

    while (isUniqueIdExists) {
        const randomNumber = String(
            Math.floor(1000 + Math.random() * 9000)
        );

        uniqueId = `${prefix}${randomNumber}`;

        const existingUniqueId = await schemaName.findOne({
            uniqueId,
        });

        if (!existingUniqueId) {
            isUniqueIdExists = false;
        }
    }

    return uniqueId;
};


