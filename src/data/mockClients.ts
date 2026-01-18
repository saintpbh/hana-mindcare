export interface Client {
    id: string;
    name: string;
    englishName?: string;
    age: number;
    gender: "Male" | "Female";
    condition: string;
    status: "stable" | "attention" | "crisis";
    lastSession: string;
    nextSession: string;
    sessionTime: string; // New field for time slot
    location?: string; // New field for session location
    isSessionCanceled?: boolean; // New field for cancellation status
    tags: string[];
    notes: string;
    contact: string;
}

// Helper to get relative dates
const getRelativeDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

export const MOCK_CLIENTS: Client[] = [
    {
        id: "1",
        name: "김민준",
        englishName: "Minjun Kim",
        age: 34,
        gender: "Male",
        condition: "Generalized Anxiety Disorder",
        status: "attention",
        lastSession: getRelativeDate(-7),
        nextSession: getRelativeDate(0), // Today
        sessionTime: "14:00",
        location: "선릉 센터",
        isSessionCanceled: false,
        tags: ["Anxiety", "Work Stress", "Insomnia"],
        notes: "최근 직장 내 프로젝트 압박으로 인한 수면 장애 호소. 이완 요법 적용 중.",
        contact: "010-1234-5678"
    },
    {
        id: "2",
        name: "이지은",
        englishName: "Jieun Lee",
        age: 28,
        gender: "Female",
        condition: "Major Depressive Disorder",
        status: "stable",
        lastSession: getRelativeDate(-5),
        nextSession: getRelativeDate(0), // Today
        sessionTime: "16:00",
        location: "양재 센터",
        isSessionCanceled: false,
        tags: ["Depression", "Self-Esteem"],
        notes: "약물 치료와 병행하며 상태 호전 중. 인지 왜곡 수정 작업 진행.",
        contact: "010-2345-6789"
    },
    {
        id: "3",
        name: "박서준",
        englishName: "Seojun Park",
        age: 41,
        gender: "Male",
        condition: "PTSD",
        status: "crisis",
        lastSession: getRelativeDate(-2),
        nextSession: getRelativeDate(1), // Tomorrow (This Week)
        sessionTime: "10:00",
        location: "논현 센터",
        isSessionCanceled: false,
        tags: ["Trauma", "Avoidance"],
        notes: "교통사고 후 운전 공포증 지속. 최근 플래시백 빈도 증가로 위기 개입 필요.",
        contact: "010-3456-7890"
    },
    {
        id: "4",
        name: "최수아",
        englishName: "Sua Choi",
        age: 22,
        gender: "Female",
        condition: "Social Anxiety",
        status: "stable",
        lastSession: getRelativeDate(-14),
        nextSession: getRelativeDate(2), // +2 Days (This Week)
        sessionTime: "11:00",
        location: "선릉 센터",
        isSessionCanceled: false,
        tags: ["Social Skills", "University"],
        notes: "대학 발표 과제 수행 성공. 긍정적 강화 필요.",
        contact: "010-4567-8901"
    },
    {
        id: "5",
        name: "정도윤",
        englishName: "Doyun Jung",
        age: 38,
        gender: "Male",
        condition: "Bipolar II Disorder",
        status: "attention",
        lastSession: getRelativeDate(-3),
        nextSession: getRelativeDate(3), // +3 Days (This Week)
        sessionTime: "15:00",
        location: "양재 센터",
        isSessionCanceled: false,
        tags: ["Mood Swings", "Manic"],
        notes: "경조증 삽화 조짐 보임. 수면 시간 체크 필수.",
        contact: "010-5678-9012"
    },
    {
        id: "6",
        name: "강하윤",
        englishName: "Hayun Kang",
        age: 30,
        gender: "Female",
        condition: "Panic Disorder",
        status: "stable",
        lastSession: getRelativeDate(-10),
        nextSession: getRelativeDate(5), // +5 Days (This Week/Next Week boundary)
        sessionTime: "09:00",
        location: "논현 센터",
        isSessionCanceled: true, // Mock Canceled
        tags: ["Panic Formatting", "CBT"],
        notes: "광장 공포증 많이 완화됨. 대중교통 이용 시도 중.",
        contact: "010-6789-0123"
    },
    {
        id: "7",
        name: "윤지후",
        englishName: "Jihu Yoon",
        age: 19,
        gender: "Male",
        condition: "ADHD",
        status: "attention",
        lastSession: getRelativeDate(-7),
        nextSession: getRelativeDate(8), // +8 Days (Next Week / Month)
        sessionTime: "17:00",
        location: "선릉 센터",
        isSessionCanceled: false,
        tags: ["Focus", "Impulsivity"],
        notes: "학업 집중 어려움 호소. 플래너 사용 훈련 중이나 지속성이 떨어짐.",
        contact: "010-7890-1234"
    },
    {
        id: "8",
        name: "장서연",
        englishName: "Seoyeon Jang",
        age: 45,
        gender: "Female",
        condition: "Grief/Loss",
        status: "stable",
        lastSession: getRelativeDate(-20),
        nextSession: getRelativeDate(12), // +12 Days (Month)
        sessionTime: "13:00",
        location: "양재 센터",
        isSessionCanceled: false,
        tags: ["Family", "Bereavement"],
        notes: "어머니 사별 후 애도 과정 중. 감정 표현이 좀 더 자유로워짐.",
        contact: "010-8901-2345"
    },
    {
        id: "9",
        name: "임준우",
        englishName: "Junwoo Lim",
        age: 50,
        gender: "Male",
        condition: "Alcohol Use Disorder",
        status: "crisis",
        lastSession: getRelativeDate(-1),
        nextSession: getRelativeDate(15), // +15 Days (Month)
        sessionTime: "19:00",
        location: "논현 센터",
        isSessionCanceled: false,
        tags: ["Addiction", "Relapse"],
        notes: "재발 위험 높음. 최근 음주 욕구 강하게 느낌. AA 모임 참여 독려.",
        contact: "010-9012-3456"
    },
    {
        id: "10",
        name: "한채원",
        englishName: "Chaewon Han",
        age: 26,
        gender: "Female",
        condition: "Eating Disorder",
        status: "attention",
        lastSession: getRelativeDate(-4),
        nextSession: getRelativeDate(20), // +20 Days (Month)
        sessionTime: "15:00",
        location: "선릉 센터",
        isSessionCanceled: false,
        tags: ["Body Image", "Anorexia"],
        notes: "식사 일지 기록 양호하나 체중 강박 여전함.",
        contact: "010-0123-4567"
    },
    // ... Keeping remaining static or simple for now, can map more if needed
    {
        id: "11",
        name: "오은우",
        englishName: "Eunwoo Oh",
        age: 33,
        gender: "Male",
        condition: "OCD",
        status: "stable",
        lastSession: "2024-10-10",
        nextSession: getRelativeDate(25), // +25 Days (Month)
        sessionTime: "11:00",
        location: "양재 센터",
        isSessionCanceled: false,
        tags: ["Compulsion", "Anxiety"],
        notes: "확인 강박 행동 빈도 감소. 노출 및 반응 방지 치료 효과적.",
        contact: "010-1234-5678"
    },
    // Rest can remain or simple update
];
