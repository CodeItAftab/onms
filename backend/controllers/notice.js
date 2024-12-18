const { TryCatch } = require("../middlewares/error");
const Student = require("../models/student");
const Teacher = require("../models/teacher");
const Notice = require("../models/notice");

exports.createNotice = TryCatch(async (req, res, next) => {
  const {
    title,
    subject,
    content,
    category,
    rollnumber,
    email,
    student,
    department,
    recipient,
  } = req.body;

  if (req.user.role === "student") {
    res.status(403).json({ success: false, message: "Unauthorized Access" });
  }

  const notice = new Notice({
    creator: req.user._id,
    title,
    subject,
    category,
    content,
  });
  await notice.save();

  if (student && recipient == "students") {
    let students;
    if (student === "all students") {
      students = await Student.find(
        department && department !== "ALL" ? { department } : {},
        "_id notices"
      );
      students.forEach(async (student) => {
        student.notices.push(notice._id);
        await student.save();
      });
      // getIO()
      //   .to(students.map((student) => getSocketId(student._id)))
      //   .emit("new-notice");
      return res.json({ success: true, message: "Notice created" });
    }
    if (years.includes(student)) {
      const students = await Student.find(
        {
          $and: [
            {
              department:
                department != "" &&
                department !== "ALL" &&
                department !== undefined
                  ? department
                  : { $exists: true },
            },
            {
              sememster: { $in: [year[student] * 2 - 1, year[student] * 2] },
            },
          ],
        },
        "_id notices"
      );
      students.forEach(async (student) => {
        student.notices.push(notice._id);
        await student.save();
      });
      // getIO()
      //   .to(students.map((student) => getSocketId(student._id)))
      //   .emit("new-notice");
      return res.json({
        success: true,
        message: "Notice yearwise created",
        students,
      });
    }
  }

  if (recipient === "individual student") {
    const std = await Student.findOne({ rollnumber }, "_id notices");

    std?.notices.push(notice._id);
    await std?.save();

    // getIO().to(getSocketId(std._id)).emit("new-notice");
    return res.json({ success: true, message: "Notice created", student: std });
  }

  if (recipient === "individual teacher") {
    const teacher = await Teacher.findOne({ email }, "_id notices");
    teacher.notices.push(notice._id);
    await teacher.save();
    // getIO().to(getSocketId(teacher._id)).emit("new-notice");
    return res.json({ success: true, message: "Notice created", teacher });
  }

  if (recipient === "teachers") {
    const teachers = await Teacher.find({}, "_id notices");
    teachers.forEach(async (teacher) => {
      if (teacher._id.toString() !== req.user._id.toString()) {
        teacher.notices.push(notice._id);
        await teacher.save();
      }
    });
    // getIO()
    //   .to(teachers.map((teacher) => getSocketId(teacher._id)))
    //   .emit("new-notice");
    return res.json({ success: true, message: "Notice created", teachers });
  }
});

exports.editNotice = TryCatch(async (req, res, next) => {
  const { title, subject, content, category, noticeId } = req.body;
  const notice = await Notice.findById(noticeId);
  notice.title = title;
  notice.subject = subject;
  notice.content = content;
  notice.category = category;
  await notice.save();
  res.json({ success: true, message: "Notice updated" });
});

exports.getAllNotices = TryCatch(async (req, res, next) => {
  const notices = await Notice.find({ _id: { $in: req.user.notices } })
    .populate("creator", "name")
    .sort({
      updatedAt: -1,
    });

  res.json({
    success: true,
    message: "All notices",
    notices: notices,
  });
});

exports.getNotice = TryCatch(async (req, res, next) => {
  const notice = await Notice.findById(req.params.id).populate(
    "creator",
    "name"
  );
  res.json({ success: true, message: "Notice Fetched", notice });
});

exports.getAllSentNotices = TryCatch(async (req, res, next) => {
  const notices = await Notice.find({ creator: req.user._id }).sort({
    updatedAt: -1,
  });
  res.json({ success: true, message: "All sent notices", notices });
});

exports.deleteNotice = TryCatch(async (req, res, next) => {
  const { noticeId } = req.body;
  await Notice.findByIdAndDelete(noticeId);
  res.json({ success: true, message: "Notice deleted" });
});

exports.updateNotice = TryCatch(async (req, res, next) => {
  const { _id, subject, category, content } = req.body;
  const notice = await Notice.findById(_id);
  notice.subject = subject;
  notice.category = category;
  notice.content = content;
  await notice.save();
  res.json({ success: true, message: "Notice updated" });
});
