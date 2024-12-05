//todo
const { getAllStudents } = require("../models/studentModel");
const { insertSeatAllocations } = require("../models/seatModel");

const allocateSeats = async (req, res) => {
  try {
    const { classrooms } = req.body; // classrooms = [{ threeSeaters: number, fiveSeaters: number }]
    if (!classrooms || !classrooms.length) {
      return res.status(400).send({ error: "Classrooms data is required" });
    }

    // Fetch all students
    const students = await getAllStudents();
    if (!students || !students.length) {
      return res
        .status(400)
        .send({ error: "No students available for allocation" });
    }

    // Organize students by course
    const courseGroups = new Map();
    students.forEach((student) => {
      if (!courseGroups.has(student.course_id)) {
        courseGroups.set(student.course_id, []);
      }
      courseGroups.get(student.course_id).push(student);
    });

    const seatAllocations = [];
    let classroomIndex = 1;

    classrooms.forEach(({ threeSeaters, fiveSeaters }) => {
      let threeSeaterCount = 1;
      let fiveSeaterCount = 1;

      // Allocate three-seaters (2 students from different courses)
      while (threeSeaters > 0) {
        const courses = Array.from(courseGroups.keys()).filter(
          (course) => courseGroups.get(course).length > 0
        );

        if (courses.length < 2) break; // Not enough students from different courses
        const [course1, course2] = courses;

        const student1 = courseGroups.get(course1).pop();
        const student2 = courseGroups.get(course2).pop();

        seatAllocations.push({
          student_id: student1.student_id,
          seat_type: "three_seater",
          seat_number: `3S-${threeSeaterCount}-${classroomIndex}`,
          classroom_number: classroomIndex, // Added classroom number
        });
        seatAllocations.push({
          student_id: student2.student_id,
          seat_type: "three_seater",
          seat_number: `3S-${threeSeaterCount}-${classroomIndex}`,
          classroom_number: classroomIndex, // Added classroom number
        });

        threeSeaters--;
        threeSeaterCount++;

        // Remove empty course groups
        if (courseGroups.get(course1).length === 0)
          courseGroups.delete(course1);
        if (courseGroups.get(course2).length === 0)
          courseGroups.delete(course2);
      }

      // Allocate five-seaters (3 students: 2 from the same course, 1 from any course)
      while (fiveSeaters > 0) {
        // Find a course that has at least 2 students
        const courseWithAtLeastTwo = Array.from(courseGroups.keys()).find(
          (course) => courseGroups.get(course).length >= 2
        );

        if (!courseWithAtLeastTwo) break; // No course has enough students

        const student1 = courseGroups.get(courseWithAtLeastTwo).pop();
        const student2 = courseGroups.get(courseWithAtLeastTwo).pop();

        // Now, find a third student from any course (could be the same or different course)
        const otherCourses = Array.from(courseGroups.keys()).filter(
          (course) => courseGroups.get(course).length > 0
        );

        if (otherCourses.length === 0) break; // No more students available for allocation
        const thirdCourse =
          otherCourses[Math.floor(Math.random() * otherCourses.length)];
        const student3 = courseGroups.get(thirdCourse).pop();

        seatAllocations.push({
          student_id: student1.student_id,
          seat_type: "five_seater",
          seat_number: `5S-${fiveSeaterCount}-${classroomIndex}`,
          classroom_number: classroomIndex, // Added classroom number
        });
        seatAllocations.push({
          student_id: student2.student_id,
          seat_type: "five_seater",
          seat_number: `5S-${fiveSeaterCount}-${classroomIndex}`,
          classroom_number: classroomIndex, // Added classroom number
        });

        fiveSeaters--;
        fiveSeaterCount++;

        // Remove empty course groups
        if (courseGroups.get(courseWithAtLeastTwo).length === 0)
          courseGroups.delete(courseWithAtLeastTwo);
        if (courseGroups.get(thirdCourse).length === 0)
          courseGroups.delete(thirdCourse);
      }

      classroomIndex++;
    });

    if (!seatAllocations.length) {
      return res.status(400).send({ error: "No allocations could be made" });
    }

    // Check if there are any students left without a seat
    const remainingStudents = Array.from(courseGroups.values()).flat();
    if (remainingStudents.length > 0) {
      return res.status(400).send({
        message:
          "Seat allocation successful with some students left unallocated",
        remaining_students: remainingStudents, // Optionally include the remaining students
      });
    }

    // Insert all allocations into the database
    await insertSeatAllocations(
      seatAllocations.map(
        ({ student_id, seat_type, seat_number, classroom_number }) => [
          student_id,
          seat_type,
          seat_number,
          classroom_number, // Include classroom number in the insert
        ]
      )
    );

    res.send({
      message: "Seat allocation successful",
      allocations: seatAllocations,
    });
  } catch (err) {
    console.error("Error during seat allocation:", err);
    res.status(500).send({ error: "Internal server error" });
  }
};

module.exports = { allocateSeats };
