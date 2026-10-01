import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import {
  MockInterview,
  AptitudeTest,
  UserAnswer,
  Question,
  ChatHistory,
  UserActivity,
} from "@/utils/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import moment from "moment";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { userId } = auth();
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    if (!userId && !userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectToDatabase();

    // 1. Fetch user data across collections using isolated filters
    const userEmailFilter = userEmail ? [userEmail] : [];
    const userIdFilter = userId ? [userId] : [];

    const interviewQuery = {
      $or: [
        ...(userIdFilter.length ? [{ userId: userIdFilter[0] }] : []),
        ...(userEmailFilter.length ? [{ createdBy: userEmailFilter[0] }] : []),
      ],
    };

    const aptitudeQuery = {
      $or: [
        ...(userIdFilter.length ? [{ userId: userIdFilter[0] }] : []),
        ...(userEmailFilter.length ? [{ createdBy: userEmailFilter[0] }] : []),
      ],
    };

    const userAnswerQuery = {
      $or: [
        ...(userIdFilter.length ? [{ userId: userIdFilter[0] }] : []),
        ...(userEmailFilter.length ? [{ userEmail: userEmailFilter[0] }] : []),
      ],
    };

    const questionQuery = {
      $or: [
        ...(userIdFilter.length ? [{ userId: userIdFilter[0] }] : []),
        ...(userEmailFilter.length ? [{ createdBy: userEmailFilter[0] }] : []),
      ],
    };

    const chatQuery = {
      $or: [
        ...(userIdFilter.length ? [{ userId: userIdFilter[0] }] : []),
        ...(userEmailFilter.length ? [{ userEmail: userEmailFilter[0] }] : []),
      ],
    };

    const activityQuery = {
      $or: [
        ...(userIdFilter.length ? [{ userId: userIdFilter[0] }] : []),
        ...(userEmailFilter.length ? [{ email: userEmailFilter[0] }] : []),
      ],
    };

    const [
      interviews,
      aptitudeTests,
      userAnswers,
      questions,
      chatSessions,
      userActivities,
    ] = await Promise.all([
      db.collection(MockInterview).find(interviewQuery).sort({ _id: -1 }).toArray(),
      db.collection(AptitudeTest).find(aptitudeQuery).sort({ _id: -1 }).toArray(),
      db.collection(UserAnswer).find(userAnswerQuery).sort({ _id: -1 }).toArray(),
      db.collection(Question).find(questionQuery).sort({ _id: -1 }).toArray(),
      db.collection(ChatHistory).find(chatQuery).sort({ updatedAt: -1 }).toArray(),
      db.collection(UserActivity).find(activityQuery).sort({ timestamp: -1 }).toArray(),
    ]);

    // 2. Build Daily Activity Map for Calendar & Streaks
    const dailyActivityMap = {}; // "YYYY-MM-DD" -> { count, interviews, aptitude, questions, chat, activity }

    const registerActivityDay = (dateInput, type, count = 1) => {
      if (!dateInput) return;
      let dateStr = "";
      if (typeof dateInput === "string") {
        dateStr = dateInput.substring(0, 10);
      } else if (dateInput instanceof Date) {
        dateStr = moment(dateInput).format("YYYY-MM-DD");
      }
      if (!dateStr || dateStr.length < 10) return;

      if (!dailyActivityMap[dateStr]) {
        dailyActivityMap[dateStr] = {
          count: 0,
          interviews: 0,
          aptitude: 0,
          questions: 0,
          chat: 0,
          activities: 0,
        };
      }
      dailyActivityMap[dateStr].count += count;
      if (type === "interview") dailyActivityMap[dateStr].interviews += count;
      else if (type === "aptitude") dailyActivityMap[dateStr].aptitude += count;
      else if (type === "question") dailyActivityMap[dateStr].questions += count;
      else if (type === "chat") dailyActivityMap[dateStr].chat += count;
      else dailyActivityMap[dateStr].activities += count;
    };

    interviews.forEach((i) => registerActivityDay(i.createdAt || i._id?.getTimestamp(), "interview"));
    aptitudeTests.forEach((a) => registerActivityDay(a.createdAt || a._id?.getTimestamp(), "aptitude"));
    userAnswers.forEach((u) => registerActivityDay(u.createdAt || u._id?.getTimestamp(), "question"));
    questions.forEach((q) => registerActivityDay(q.createdAt || q._id?.getTimestamp(), "question"));
    chatSessions.forEach((c) => registerActivityDay(c.createdAt || c.updatedAt, "chat"));
    userActivities.forEach((act) => registerActivityDay(act.createdAt || act.timestamp, "activity"));

    const activeDatesSorted = Object.keys(dailyActivityMap).sort();
    const activeDaysCount = activeDatesSorted.length;

    // 3. Streak Logic
    const todayStr = moment().format("YYYY-MM-DD");
    const yesterdayStr = moment().subtract(1, "days").format("YYYY-MM-DD");

    let currentStreak = 0;
    let startDateForStreak = null;

    if (dailyActivityMap[todayStr]) {
      startDateForStreak = moment(todayStr);
    } else if (dailyActivityMap[yesterdayStr]) {
      startDateForStreak = moment(yesterdayStr);
    }

    if (startDateForStreak) {
      let checkDate = startDateForStreak.clone();
      while (dailyActivityMap[checkDate.format("YYYY-MM-DD")]) {
        currentStreak++;
        checkDate.subtract(1, "days");
      }
    }

    // Longest Streak
    let longestStreak = 0;
    let tempStreak = 0;
    let prevMoment = null;

    activeDatesSorted.forEach((dStr) => {
      const currMoment = moment(dStr);
      if (!prevMoment) {
        tempStreak = 1;
      } else {
        const diff = currMoment.diff(prevMoment, "days");
        if (diff === 1) {
          tempStreak++;
        } else if (diff > 1) {
          tempStreak = 1;
        }
      }
      prevMoment = currMoment;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    });

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    // 4. Calculate Summary Metrics
    const totalInterviews = interviews.length;
    const totalAptitudeTests = aptitudeTests.length;
    
    let totalQuestionsFromAnswers = userAnswers.length;
    let totalQuestionsFromBank = questions.length;
    let totalAptitudeQuestionsAttempted = aptitudeTests.reduce(
      (sum, a) => sum + (Number(a.totalQuestions) || 10),
      0
    );
    const totalQuestionsPracticed =
      totalQuestionsFromAnswers + totalQuestionsFromBank + totalAptitudeQuestionsAttempted;

    // Average Interview Rating (UserAnswer rating 1-10)
    const validRatings = userAnswers
      .map((u) => Number(u.rating))
      .filter((r) => !isNaN(r) && r > 0);

    const avgInterviewRatingRaw =
      validRatings.length > 0
        ? validRatings.reduce((a, b) => a + b, 0) / validRatings.length
        : 0;
    const avgInterviewScoreFormatted = avgInterviewRatingRaw
      ? avgInterviewRatingRaw.toFixed(1) + "/10"
      : "N/A";
    const avgInterviewScorePct = avgInterviewRatingRaw ? Math.round(avgInterviewRatingRaw * 10) : 0;

    // Average Aptitude Score (%)
    const scoredAptitudeTests = aptitudeTests.filter(
      (a) => a.percentage !== undefined || a.score !== undefined
    );
    let avgAptitudePct = 0;
    if (scoredAptitudeTests.length > 0) {
      const totalPct = scoredAptitudeTests.reduce((sum, a) => {
        if (a.percentage !== undefined) return sum + Number(a.percentage);
        if (a.score !== undefined && a.totalQuestions)
          return sum + Math.round((Number(a.score) / Number(a.totalQuestions)) * 100);
        return sum + 70; // fallback default
      }, 0);
      avgAptitudePct = Math.round(totalPct / scoredAptitudeTests.length);
    }

    // Total Practice Time Calculation (Minutes)
    const interviewTime = totalInterviews * 15;
    const aptitudeTime = totalAptitudeTests * 10;
    const questionTime = Math.round(userAnswers.length * 2.5);
    const chatTime = chatSessions.length * 5;
    const totalPracticeTimeMinutes = interviewTime + aptitudeTime + questionTime + chatTime;
    const practiceHours = Math.floor(totalPracticeTimeMinutes / 60);
    const practiceMins = totalPracticeTimeMinutes % 60;
    const totalPracticeTimeFormatted =
      practiceHours > 0 ? `${practiceHours}h ${practiceMins}m` : `${practiceMins}m`;

    // 5. GitHub 12-Month Calendar Grid Data
    const calendarDays = [];
    const endDate = moment();
    const startDate = moment().subtract(364, "days");

    let curr = startDate.clone();
    while (curr.isBefore(endDate) || curr.isSame(endDate, "day")) {
      const dateStr = curr.format("YYYY-MM-DD");
      const dayData = dailyActivityMap[dateStr] || { count: 0 };
      const count = dayData.count || 0;

      let level = 0;
      if (count >= 7) level = 4;
      else if (count >= 5) level = 3;
      else if (count >= 3) level = 2;
      else if (count >= 1) level = 1;

      calendarDays.push({
        date: dateStr,
        count,
        level,
        dayOfWeek: curr.day(),
        month: curr.format("MMM"),
        details: dayData,
      });
      curr.add(1, "days");
    }

    // 6. Performance Analytics Datasets
    // A) Interview Scores over time
    const interviewScoresOverTime = userAnswers
      .filter((u) => u.rating && !isNaN(Number(u.rating)))
      .map((u) => ({
        id: u._id?.toString() || Math.random().toString(),
        date: u.createdAt || "Recent",
        score: Number(u.rating),
        question: u.question ? u.question.substring(0, 40) + "..." : "Interview Question",
      }))
      .slice(-15);

    // B) Aptitude Scores over time
    const aptitudeScoresOverTime = aptitudeTests
      .filter((a) => a.percentage !== undefined || a.score !== undefined)
      .map((a) => ({
        id: a._id?.toString() || a.mockId,
        date: a.createdAt || "Recent",
        topic: a.topic || "General Aptitude",
        score: a.percentage !== undefined ? Number(a.percentage) : Math.round((Number(a.score || 0) / Number(a.totalQuestions || 10)) * 100),
      }))
      .slice(-15);

    // C) Activities by Month (Last 6 Months)
    const monthlyActivity = [];
    for (let i = 5; i >= 0; i--) {
      const m = moment().subtract(i, "months");
      const monthLabel = m.format("MMM YYYY");
      const monthPrefix = m.format("YYYY-MM");

      const interviewCount = interviews.filter((x) =>
        (x.createdAt || "").startsWith(monthPrefix)
      ).length;
      const aptitudeCount = aptitudeTests.filter((x) =>
        (x.createdAt || "").startsWith(monthPrefix)
      ).length;
      const questionCount = userAnswers.filter((x) =>
        (x.createdAt || "").startsWith(monthPrefix)
      ).length;

      monthlyActivity.push({
        month: monthLabel,
        interviews: interviewCount,
        aptitude: aptitudeCount,
        questions: questionCount,
        total: interviewCount + aptitudeCount + questionCount,
      });
    }

    // D) Technical vs HR Performance comparison
    const techInterviews = interviews.filter(
      (i) =>
        !i.jobPosition ||
        !i.jobPosition.toLowerCase().includes("hr")
    );
    const hrInterviews = interviews.filter((i) =>
      (i.jobPosition || "").toLowerCase().includes("hr")
    );

    const techAnswers = userAnswers.filter(
      (u) => !u.question || !u.question.toLowerCase().includes("behavioral")
    );
    const hrAnswers = userAnswers.filter(
      (u) => u.question && u.question.toLowerCase().includes("behavioral")
    );

    const techAvgRating =
      techAnswers.length > 0
        ? (techAnswers.reduce((sum, u) => sum + Number(u.rating || 0), 0) / techAnswers.length).toFixed(1)
        : avgInterviewRatingRaw ? avgInterviewRatingRaw.toFixed(1) : "N/A";

    const hrAvgRating =
      hrAnswers.length > 0
        ? (hrAnswers.reduce((sum, u) => sum + Number(u.rating || 0), 0) / hrAnswers.length).toFixed(1)
        : "7.5";

    // E) Questions by Category Breakdown
    const categoryCounts = {
      Technical: userAnswers.length || 0,
      Aptitude: totalAptitudeQuestionsAttempted || 0,
      "HR & Behavioral": hrAnswers.length || 0,
      "Coding & DSA": chatSessions.filter((c) => c.mode === "Coding/DSA").length * 5,
      "System Design": chatSessions.filter((c) => c.mode === "System Design").length * 5,
    };

    const questionsByCategory = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    }));

    // 7. Recent Activity Timeline
    const combinedActivities = [];

    interviews.forEach((i) => {
      combinedActivities.push({
        id: `int_${i.mockId || i._id}`,
        type: "interview",
        title: `Mock Interview: ${i.jobPosition || "General Role"}`,
        subtitle: `${i.jobExperience ? i.jobExperience + " YOE" : "Practice Session"}`,
        date: i.createdAt || i._id?.getTimestamp() || new Date(),
        rawDate: new Date(i.createdAt || i._id?.getTimestamp() || Date.now()),
        score: null,
        link: `/dashboard/interview/${i.mockId}/start`,
      });
    });

    aptitudeTests.forEach((a) => {
      const pct = a.percentage !== undefined ? `${a.percentage}%` : a.score !== undefined ? `${a.score}/${a.totalQuestions || 10}` : null;
      combinedActivities.push({
        id: `apt_${a.mockId || a._id}`,
        type: "aptitude",
        title: `Aptitude Test: ${a.topic || "General"}`,
        subtitle: `Difficulty: ${a.difficulty || "Intermediate"}`,
        date: a.createdAt || a._id?.getTimestamp() || new Date(),
        rawDate: new Date(a.createdAt || a._id?.getTimestamp() || Date.now()),
        score: pct,
        link: `/dashboard/aptitude/${a.mockId}/start`,
      });
    });

    userAnswers.forEach((u) => {
      combinedActivities.push({
        id: `ans_${u._id}`,
        type: "question",
        title: `Answer Evaluated`,
        subtitle: u.question ? u.question.substring(0, 50) + "..." : "Interview Question",
        date: u.createdAt || u._id?.getTimestamp() || new Date(),
        rawDate: new Date(u.createdAt || u._id?.getTimestamp() || Date.now()),
        score: u.rating ? `${u.rating}/10` : null,
        link: u.mockIdRef ? `/dashboard/interview/${u.mockIdRef}/feedback` : `/dashboard/question`,
      });
    });

    chatSessions.forEach((c) => {
      let actType = "career";
      if (c.mode === "Resume Review") actType = "resume";
      else if (c.mode === "Technical Interview" || c.mode === "Coding/DSA") actType = "interview";

      combinedActivities.push({
        id: `chat_${c.chatId || c._id}`,
        type: actType,
        title: `${c.mode || "AI Coach Session"}: ${c.title || "Chat"}`,
        subtitle: `${c.messages ? c.messages.length + " messages" : "Interactive Chat"}`,
        date: c.updatedAt || c.createdAt || new Date(),
        rawDate: new Date(c.updatedAt || c.createdAt || Date.now()),
        score: null,
        link: `/dashboard/chatbot`,
      });
    });

    userActivities.forEach((act) => {
      if (act.action === "login") return; // Keep login separate or skip for cleaner timeline
      let actType = "question";
      if (act.action === "interview_created" || act.action === "feedback_submitted") actType = "interview";
      else if (act.action === "aptitude_created" || act.action === "aptitude_completed") actType = "aptitude";

      combinedActivities.push({
        id: `act_${act._id}`,
        type: actType,
        title: act.action.replace(/_/g, " ").toUpperCase(),
        subtitle: act.metadata?.jobPosition || act.metadata?.topic || "Activity logged",
        date: act.createdAt || act.timestamp || new Date(),
        rawDate: new Date(act.timestamp || act.createdAt || Date.now()),
        score: act.score !== undefined ? `${act.score}` : act.metadata?.rating ? `${act.metadata.rating}/10` : null,
        link: act.metadata?.mockId ? `/dashboard/interview/${act.metadata.mockId}` : `/dashboard`,
      });
    });

    // Sort descending by date and slice top 15
    const recentActivityTimeline = combinedActivities
      .sort((a, b) => b.rawDate - a.rawDate)
      .slice(0, 15)
      .map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        subtitle: item.subtitle,
        date: moment(item.date).fromNow(),
        fullDate: moment(item.date).format("MMM DD, YYYY HH:mm"),
        score: item.score,
        link: item.link,
      }));

    // 8. Achievements Badges
    const achievements = [
      {
        id: "first_interview",
        title: "First Step",
        description: "Complete your first Mock Interview",
        category: "Interview",
        unlocked: totalInterviews >= 1,
        progress: Math.min(100, (totalInterviews / 1) * 100),
        targetText: "1 Interview",
        currentValue: totalInterviews,
      },
      {
        id: "5_interviews",
        title: "Interview Veteran",
        description: "Complete 5 Mock Interviews",
        category: "Interview",
        unlocked: totalInterviews >= 5,
        progress: Math.min(100, Math.round((totalInterviews / 5) * 100)),
        targetText: "5 Interviews",
        currentValue: totalInterviews,
      },
      {
        id: "10_tests",
        title: "Aptitude Master",
        description: "Attempt 10 Aptitude Tests",
        category: "Aptitude",
        unlocked: totalAptitudeTests >= 10,
        progress: Math.min(100, Math.round((totalAptitudeTests / 10) * 100)),
        targetText: "10 Tests",
        currentValue: totalAptitudeTests,
      },
      {
        id: "streak_7",
        title: "7-Day Warrior",
        description: "Maintain a 7-day practice streak",
        category: "Streak",
        unlocked: longestStreak >= 7,
        progress: Math.min(100, Math.round((longestStreak / 7) * 100)),
        targetText: "7 Days",
        currentValue: longestStreak,
      },
      {
        id: "streak_30",
        title: "30-Day Legend",
        description: "Maintain a 30-day practice streak",
        category: "Streak",
        unlocked: longestStreak >= 30,
        progress: Math.min(100, Math.round((longestStreak / 30) * 100)),
        targetText: "30 Days",
        currentValue: longestStreak,
      },
      {
        id: "100_questions",
        title: "Century Practiced",
        description: "Practice 100 questions across interviews & tests",
        category: "Questions",
        unlocked: totalQuestionsPracticed >= 100,
        progress: Math.min(100, Math.round((totalQuestionsPracticed / 100) * 100)),
        targetText: "100 Questions",
        currentValue: totalQuestionsPracticed,
      },
      {
        id: "personal_best",
        title: "Top Performer",
        description: "Achieve an Interview rating >= 9/10 or Aptitude score >= 90%",
        category: "Performance",
        unlocked:
          validRatings.some((r) => r >= 9) ||
          scoredAptitudeTests.some((a) => (a.percentage || 0) >= 90),
        progress:
          validRatings.some((r) => r >= 9) ||
          scoredAptitudeTests.some((a) => (a.percentage || 0) >= 90)
            ? 100
            : Math.round(
                (Math.max(
                  ...validRatings,
                  ...scoredAptitudeTests.map((a) => (a.percentage || 0) / 10),
                  0
                ) /
                  9) *
                  100
              ),
        targetText: "9/10 Score",
        currentValue:
          Math.max(
            ...validRatings,
            ...scoredAptitudeTests.map((a) => (a.percentage || 0) / 10),
            0
          ).toFixed(1) + "/10",
      },
    ];

    // 9. Progress Section Percentages
    const progressSection = {
      interviewPrep: Math.min(100, Math.round((totalInterviews / 5) * 100)),
      aptitudePrep: Math.min(100, Math.round((totalAptitudeTests / 5) * 100)),
      technicalTopic: Math.min(
        100,
        Math.round((userAnswers.length / 15) * 100)
      ),
      hrPrep: Math.min(
        100,
        Math.round((hrAnswers.length / 5) * 100)
      ),
      dsaCoding: Math.min(
        100,
        Math.round(
          (chatSessions.filter((c) => c.mode === "Coding/DSA").length / 3) * 100
        )
      ),
    };

    // 10. Personalized AI/Rule-based Insights
    let strongestArea = "Technical Concepts";
    let strongestDetail = "Solid foundation with steady evaluations.";
    if (avgInterviewRatingRaw >= 8) {
      strongestArea = "Mock Interview Performance";
      strongestDetail = `High average interview score of ${avgInterviewScoreFormatted}.`;
    } else if (avgAptitudePct >= 80) {
      strongestArea = "Quantitative Aptitude";
      strongestDetail = `Impressive aptitude accuracy rate of ${avgAptitudePct}%.`;
    } else if (totalInterviews > 0) {
      strongestArea = "Interview Consistency";
      strongestDetail = `${totalInterviews} interviews completed to date.`;
    }

    let weakestArea = "HR & Behavioral Scenarios";
    let weakestDetail = "Focus on structuring answers using the STAR method.";
    if (avgAptitudePct > 0 && avgAptitudePct < 70) {
      weakestArea = "Quantitative Aptitude Speed";
      weakestDetail = `Aptitude average is ${avgAptitudePct}%. Practice timed tests to improve speed.`;
    } else if (userAnswers.length > 0 && avgInterviewRatingRaw < 7) {
      weakestArea = "Technical Communication Depth";
      weakestDetail = `Average rating is ${avgInterviewScoreFormatted}. Elaborate with specific technical examples.`;
    } else if (totalAptitudeTests === 0) {
      weakestArea = "Aptitude Assessment";
      weakestDetail = "No aptitude tests attempted yet. Try your first quantitative test!";
    }

    let recentImprovement = "Consistent Practice";
    if (currentStreak >= 3) {
      recentImprovement = `${currentStreak}-Day Active Streak`;
    } else if (validRatings.length >= 2) {
      const recentRatings = validRatings.slice(0, 2);
      const diff = recentRatings[0] - recentRatings[1];
      if (diff > 0) {
        recentImprovement = `Rating increased by +${diff.toFixed(1)} points in recent interviews!`;
      }
    }

    let recommendedArea = "Mock Interview Practice";
    if (totalInterviews === 0) recommendedArea = "Complete 1st Mock Interview";
    else if (totalAptitudeTests === 0) recommendedArea = "Attempt Quantitative Aptitude Test";
    else if (hrAnswers.length === 0) recommendedArea = "Practice Behavioral HR Questions";
    else recommendedArea = "Take a Targeted System Design / DSA Mock Session";

    let suggestedDailyGoal = "Complete 1 Mock Interview & 5 Aptitude Questions";
    if (currentStreak > 0) {
      suggestedDailyGoal = `Keep your ${currentStreak}-day streak alive! Practice 1 evaluation task today.`;
    }

    const insights = {
      strongestArea,
      strongestDetail,
      weakestArea,
      weakestDetail,
      recentImprovement,
      recommendedArea,
      currentStreak,
      suggestedDailyGoal,
    };

    return NextResponse.json({
      summary: {
        activeDays: activeDaysCount,
        totalInterviews,
        totalAptitudeTests,
        totalQuestionsPracticed,
        avgInterviewScore: avgInterviewScoreFormatted,
        avgInterviewScorePct,
        avgAptitudeScore: avgAptitudePct > 0 ? `${avgAptitudePct}%` : "N/A",
        avgAptitudePct,
        currentStreak,
        longestStreak,
        totalPracticeTime: totalPracticeTimeFormatted,
        totalPracticeTimeMinutes,
      },
      calendar: calendarDays,
      analytics: {
        interviewScoresOverTime,
        aptitudeScoresOverTime,
        monthlyActivity,
        questionsByCategory,
        technicalVsHr: {
          techCount: techInterviews.length,
          techAvg: techAvgRating,
          hrCount: hrInterviews.length,
          hrAvg: hrAvgRating,
        },
      },
      recentActivity: recentActivityTimeline,
      achievements,
      progress: progressSection,
      insights,
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    return NextResponse.json({ error: err.message || "Failed to calculate dashboard statistics" }, { status: 500 });
  }
}
