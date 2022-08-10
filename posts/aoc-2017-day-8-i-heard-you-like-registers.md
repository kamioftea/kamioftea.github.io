---
tags:
  - post
  - advent-of-code-2017
  - coding
  - scala
title: I Heard You Like Registers
header: I Heard You Like Registers
date: 2017-12-15T05:00:00.000Z
updated: 2017-12-15T05:00:00.000Z
eleventyExcludeFromCollections: false
coverImage: https://static.goblinoid.co.uk/jeff-horton.uk/e1bd99e2-5071-4d00-87ac-d3c2f5005c9c.png
---
A solution for [Advent of Code 2017 - Day 8](http://adventofcode.com/2017/day/8)

## Part 1

Today the task is to parse a rudimentary instruction language. Each line of the input represents an instruction that
will update a value in a named register if a condition on another, or possibly the same register is met. Whilst this
could be done matching on the strings, scala has a rich syntax for expressing these more clearly. So firstly I set up a
way to represent the parts of the instruction. Unassigned registers default to 0.

{% raw %}
```scala
import scala.util.{Failure, Success, Try}
// import scala.util.{Failure, Success, Try}

type RegisterRef = String
// defined type alias RegisterRef

sealed trait Operator {
  def apply(a: Int, b: Int): Int
}
// defined trait Operator

case object Inc extends Operator {
  override def apply(a: Int, b: Int): Int = a + b
}
// defined object Inc

case object Dec extends Operator {
  def apply(a: Int, b: Int): Int = a - b
}
// defined object Dec

sealed trait Condition {
  def test(a: Int, b: Int): Boolean
}
// defined trait Condition

case object Eq extends Condition {
  override def test(a: Int, b: Int): Boolean = a == b
}
// defined object Eq

case object Neq extends Condition {
  override def test(a: Int, b: Int): Boolean = a != b
}
// defined object Neq

case object Lt extends Condition {
  override def test(a: Int, b: Int): Boolean = a < b
}
// defined object Lt

case object Lte extends Condition {
  override def test(a: Int, b: Int): Boolean = a <= b
}
// defined object Lte

case object Gt extends Condition {
  override def test(a: Int, b: Int): Boolean = a > b
}
// defined object Gt

case object Gte extends Condition {
  override def test(a: Int, b: Int): Boolean = a >= b
}
// defined object Gte

// The next two should be in an Condition companion object, but the plugin
// that runs the embeded code gets confused by it 
def conditionFromString(str: String): Condition = str match {
  case "==" => Eq
  case "!=" => Neq
  case "<" => Lt
  case "<=" => Lte
  case ">" => Gt
  case ">=" => Gte
}
// conditionFromString: (str: String)Condition

case class Instruction(register: RegisterRef,
                       operator: Operator,
                       value: Int,
                       conditionRegister: RegisterRef,
                       condition: Condition,
                       conditionValue: Int) {
  def apply(registers: Map[RegisterRef, Int]): Map[RegisterRef, Int] = (
    if (condition.test(registers(conditionRegister), conditionValue))
      registers.updated(register, operator(registers(register), value))
    else
      registers
  )   

  // Ignore this until part 2
  def apply(registers: Map[RegisterRef, Int], max: Int): (Map[RegisterRef, Int], Int) = (
    if (condition.test(registers(conditionRegister), conditionValue)) {
      val newVal = operator(registers(register), value)
      (registers.updated(register, newVal), Math.max(max, newVal))
    }
    else (registers, max)
  )
}
// defined class Instruction

// The next two should be in an Instruction companion object, but the plugin
// that runs the embeded code gets confused by it 
val LineParser =
    "([a-z]+) (inc|dec) (-?\\d+) if ([a-z]+) ([!<>=]{1,2}) (-?\\d+)".r
// LineParser: scala.util.matching.Regex = ([a-z]+) (inc|dec) (-?\d+) if ([a-z]+) ([!<>=]{1,2}) (-?\d+)

def instructionFromLine(line: String): Try[Instruction] = {
  line match {
    case LineParser(reg, op, value, condReg, cond, condVal) =>
      Success(Instruction(
        reg,
        if (op == "inc") Inc else Dec,
        value.toInt,
        condReg,
        conditionFromString(cond),
        condVal.toInt
      ))
  
    case _ =>
      Failure(new RuntimeException("line was not a valid instruction"))
  }
}
// instructionFromLine: (line: String)scala.util.Try[Instruction]
```
{% endraw %}

The actual task is to apply the sequence of instructions, and then find the
maximally valued register.

{% raw %}
```scala
def applyInstructions(registers: Map[RegisterRef, Int],
                      instructions: TraversableOnce[Instruction]
                     ): Map[RegisterRef, Int] =
  instructions.foldLeft(registers) { case (rs, ins) => ins(rs) }
// applyInstructions: (registers: Map[RegisterRef,Int], instructions: TraversableOnce[Instruction])Map[RegisterRef,Int]

def findMax(registers: Map[RegisterRef, Int]): (RegisterRef, Int) = (
  if (registers.isEmpty) ("", Int.MinValue)
  else registers.maxBy { case (_, v) => v }
)
// findMax: (registers: Map[RegisterRef,Int])(RegisterRef, Int)
```  
{% endraw %}

The example provided can be expanded into some test cases.

{% raw %}
```scala
import org.scalatest.{FunSuite, Matchers}
// import org.scalatest.{FunSuite, Matchers}

import scala.util.Success
// import scala.util.Success

class Day8Part1Test extends FunSuite with Matchers {

  test("can parse instruction") {
    instructionFromLine("b inc 5 if a > 1") shouldBe Success(Instruction("b", Inc, 5, "a", Gt, 1))
    instructionFromLine("a inc 1 if b < 5") shouldBe Success(Instruction("a", Inc, 1, "b", Lt, 5))
    instructionFromLine("c dec -10 if a >= 1") shouldBe Success(Instruction("c", Dec, -10, "a", Gte, 1))
    instructionFromLine("c inc -20 if c == 10") shouldBe Success(Instruction("c", Inc, -20, "c", Eq, 10))
  }

  test("can apply instruction") {
    val emptyRegister = Map.empty[RegisterRef, Int].withDefaultValue(0)

    instructionFromLine("b inc 5 if a > 1").map(_ (emptyRegister)) shouldBe Success(emptyRegister)
    instructionFromLine("b inc 5 if a > 1").map(_ (Map("a" -> 1).withDefaultValue(0))) shouldBe Success(Map("a" -> 1))
    instructionFromLine("b inc 5 if a > 1").map(_ (Map("a" -> 2).withDefaultValue(0))) shouldBe Success(Map("a" -> 2, "b" -> 5))

    instructionFromLine("a inc 1 if b < 5").map(_ (emptyRegister)) shouldBe Success(Map("a" -> 1))
    instructionFromLine("a inc 1 if b < 5").map(_ (Map("b" -> 4).withDefaultValue(0))) shouldBe Success(Map("a" -> 1, "b" -> 4))
    instructionFromLine("a inc 1 if b < 5").map(_ (Map("b" -> 5).withDefaultValue(0))) shouldBe Success(Map("b" -> 5))

    instructionFromLine("c dec -10 if a >= 1").map(_ (emptyRegister)) shouldBe Success(emptyRegister)
    instructionFromLine("c dec -10 if a >= 1").map(_ (Map("a" -> 1).withDefaultValue(0))) shouldBe Success(Map("a" -> 1, "c" -> 10))
    instructionFromLine("c dec -10 if a >= 1").map(_ (Map("a" -> 2).withDefaultValue(0))) shouldBe Success(Map("a" -> 2, "c" -> 10))

    instructionFromLine("c dec -10 if a <= 1").map(_ (emptyRegister)) shouldBe Success(Map("c" -> 10))
    instructionFromLine("c dec -10 if a <= 1").map(_ (Map("a" -> 1).withDefaultValue(0))) shouldBe Success(Map("a" -> 1, "c" -> 10))
    instructionFromLine("c dec -10 if a <= 1").map(_ (Map("a" -> 2).withDefaultValue(0))) shouldBe Success(Map("a" -> 2))

    instructionFromLine("c inc -20 if c == 10").map(_ (emptyRegister)) shouldBe Success(emptyRegister)
    instructionFromLine("c inc -20 if c == 10").map(_ (Map("c" -> 10).withDefaultValue(0))) shouldBe Success(Map("c" -> -10))
    instructionFromLine("c inc -20 if c == 10").map(_ (Map("c" -> 11, "d" -> 23).withDefaultValue(0))) shouldBe Success(Map("c" -> 11, "d" -> 23))

    instructionFromLine("a dec 20 if c != 10").map(_ (emptyRegister)) shouldBe Success(Map("a" -> -20))
    instructionFromLine("a dec 20 if c != 10").map(_ (Map("c" -> 10, "d" -> 23).withDefaultValue(0))) shouldBe Success(Map("c" -> 10, "d" -> 23))
    instructionFromLine("a dec 20 if c != 10").map(_ (Map("c" -> 11, "a" -> 23).withDefaultValue(0))) shouldBe Success(Map("c" -> 11, "a" -> 3))
  }

  test("can apply instructions") {
    val instructions: Iterator[Instruction] =
      """b inc 5 if a > 1
        |a inc 1 if b < 5
        |c dec -10 if a >= 1
        |c inc -20 if c == 10""".stripMargin.lines
        .map(instructionFromLine)
        .collect { case Success(i) => i }

    applyInstructions(Map.empty[RegisterRef, Int].withDefaultValue(0), instructions) shouldBe Map("a"->1, "c" -> -10)
  }

  test("can find maximum register value") {
    findMax(Map("a"->1, "c" -> -10)) should be ("a", 1)
  }
}
// defined class Day8Part1Test

(new Day8Part1Test).execute()
// Day8Part1Test:
// - can parse instruction
// - can apply instruction
// - can apply instructions
// - can find maximum register value
```
{% endraw %}

All the pieces are now in place to run the input program.

{% raw %}
```scala
import scala.io.Source
// import scala.io.Source

val registers = Map.empty[RegisterRef, Int].withDefaultValue(0)
// registers: scala.collection.immutable.Map[RegisterRef,Int] = Map()

def instructions: Iterator[Instruction] =
  Source.fromResource("day8input.txt").getLines().map(instructionFromLine).collect { case Success(i) => i }
// instructions: Iterator[Instruction]

findMax(applyInstructions(registers, instructions))
// res5: (RegisterRef, Int) = (gf,6343)
```
{% endraw %}

## Part 2

Since most of the leg work in the first part was interpreting the instructions part two is much simpler. It wants to
find the maximum value that was present at any point during the computation.

Originally I wrote this by calling findMax after each step. I then noticed that if the maximum was going to change, then
the newly set value would have to be the new maximum as all other values were unchanged. I wrote a different version of
Instruction.apply that you can see in the code above, that also updates the current max if required.

{% raw %}
```scala
def findProcessingMax(registers: Map[RegisterRef, Int],
                      instructions: TraversableOnce[Instruction]
                     ): Int =
  instructions.foldLeft((registers, Int.MinValue)) {
    case ((rs, max), ins) => ins(rs, max)
  }._2
// findProcessingMax: (registers: Map[RegisterRef,Int], instructions: TraversableOnce[Instruction])Int
```
{% endraw %}

Given the change was reasonably simple, I only added the example as a test for this part.

{% raw %}
```scala
class Day8Test extends FunSuite with Matchers {
  test("can find processing max") {
    val instructions: Iterator[Instruction] =
      """b inc 5 if a > 1
        |a inc 1 if b < 5
        |c dec -10 if a >= 1
        |c inc -20 if c == 10""".stripMargin.lines
        .map(instructionFromLine)
        .collect { case Success(i) => i }

    findProcessingMax(Map.empty[RegisterRef, Int].withDefaultValue(0), instructions) shouldBe 10
  }
}
// defined class Day8Test
```
{% endraw %}

Now I can complete the puzzle.

{% raw %}
```scala
findProcessingMax(registers, instructions)
// res6: Int = 7184
```
{% endraw %}