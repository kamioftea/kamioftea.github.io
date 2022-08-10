---
tags:
  - post
  - advent-of-code-2017
  - coding
  - scala
title: Duet
header: Duet
date: 2017-12-25T05:00:00.000Z
updated: 2017-12-25T05:00:00.000Z
eleventyExcludeFromCollections: false
coverImage: https://static.goblinoid.co.uk/jeff-horton.uk/e1bd99e2-5071-4d00-87ac-d3c2f5005c9c.png
---
A solution for [Advent of Code 2017 - Day 18](http://adventofcode.com/2017/day/18)

## Part 1

Today is mostly parsing assembly-like instructions. I started with a way to represent an instruction, and also that the
values can either be literal integers, or a reference to a labeled register.

{% raw %}
```scala
sealed trait Value {
  def getValue(registers: Map[Char, Long]): Long
}
// defined trait Value

case class Ref(register: Char) extends Value {
  override def getValue(registers: Map[Char, Long]): Long = registers.getOrElse(register, 0)
}
// defined class Ref

case class Literal(value: Long) extends Value {
  override def getValue(registers: Map[Char, Long]): Long = value
}
// defined class Literal

case object EmptyValue extends Value {
  override def getValue(registers: Map[Char, Long]): Long = throw new RuntimeException("Trying to get empty value")
}
// defined object EmptyValue

case class Instruction(command: String, register: Char, value: Value)
// defined class Instruction

val LineMatcher = "(snd|set|add|mul|mod|rcv|jgz) ([a-z])(?: (?:([a-z])|(-?\\d+)))?".r
// LineMatcher: scala.util.matching.Regex = (snd|set|add|mul|mod|rcv|jgz) ([a-z])(?: (?:([a-z])|(-?\d+)))?

def instFromLine(line: String): Instruction = line match {
  case LineMatcher(c, r, ref, _) if ref != null =>
    Instruction(
      c,
      r.charAt(0),
      Ref(ref.charAt(0))
    )
  case LineMatcher(c, r, _, lit) if lit != null => Instruction(c, r.charAt(0), Literal(lit.toLong))
  case LineMatcher(c, r, _, _) => Instruction(c, r.charAt(0), EmptyValue)
  // This was quite a late bugfix. I hadn't realised that a literal could also be
  // in the first value position. I had intended to refactor the parsing to 
  // handle this better, but day 23 gave me the opportunity to re-do similar
  // instruction parsing and so I left this as is.
  case "jgz 1 3" => Instruction("jmp", 'z', Literal(3))
}
// instFromLine: (line: String)Instruction

def parseLines(lines: TraversableOnce[String]): Vector[Instruction] = lines.map(instFromLine).toVector
// parseLines: (lines: TraversableOnce[String])Vector[Instruction]
```
{% endraw %}

Running the program until the first `rcv` was just a case of matching against the instructions, and updating the
registers, position, and latest `snd` value as appropriate until a valid `rcv` was reached.

{% raw %}
```scala
def getRcv(program: Vector[Instruction]): Option[Long] = {
  def iter(registers: Map[Char, Long],
           position: Int,
           sent: Option[Long]): Option[Long] = (
    if (!program.isDefinedAt(position)) None
    else program(position) match {
      case Instruction("snd", r, _) => iter(registers, position + 1, Some(registers(r)))
      case Instruction("set", r, v) => iter(registers.updated(r, v.getValue(registers)), position + 1, sent)
      case Instruction("add", r, v) => iter(registers.updated(r, registers(r) + v.getValue(registers)), position + 1, sent)
      case Instruction("mul", r, v) => iter(registers.updated(r, registers(r) * v.getValue(registers)), position + 1, sent)
      case Instruction("mod", r, v) => iter(registers.updated(r, registers(r) % v.getValue(registers)), position + 1, sent)
      case Instruction("jgz", r, v) if registers(r) > 0 => iter(registers, position + v.getValue(registers).toInt, sent)
      case Instruction("jgz", _, _) => iter(registers, position + 1, sent)
      case Instruction("rcv", r, _) if registers(r) != 0 => sent
      case Instruction("rcv", _, _) => iter(registers, position + 1, sent)
    }
  )
  iter(Map.empty.withDefaultValue(0), 0, None)
}
// getRcv: (program: Vector[Instruction])Option[Long]
```
{% endraw %}

I can use the provided example to test my parsing and that the instructions are being run correctly.

{% raw %}
```scala
import org.scalatest.{FunSuite, Matchers}
// import org.scalatest.{FunSuite, Matchers}

class Day18Part1Test extends FunSuite with Matchers {

  test("testInstFromLine") {
    instFromLine("set a 1") shouldBe Instruction("set", 'a', Literal(1))
    instFromLine("add a 2") shouldBe Instruction("add", 'a', Literal(2))
    instFromLine("mul a a") shouldBe Instruction("mul", 'a', Ref('a'))
    instFromLine("mod a 5") shouldBe Instruction("mod", 'a', Literal(5))
    instFromLine("snd a") shouldBe Instruction("snd", 'a', EmptyValue)
    instFromLine("set a 0") shouldBe Instruction("set", 'a', Literal(0))
    instFromLine("rcv a") shouldBe Instruction("rcv", 'a', EmptyValue)
    instFromLine("jgz a -1") shouldBe Instruction("jgz", 'a', Literal(-1))
    instFromLine("set a 1") shouldBe Instruction("set", 'a', Literal(1))
    instFromLine("jgz a -2") shouldBe Instruction("jgz", 'a', Literal(-2))
  }

  test("testParseLines") {
    parseLines(
      """set a 1
        |add a 2
        |mul a a
        |mod a 5
        |snd a
        |set a 0
        |rcv a
        |jgz a -1
        |set a 1
        |jgz a -2""".stripMargin.lines
    ) shouldBe Vector(
      Instruction("set", 'a', Literal(1)),
      Instruction("add", 'a', Literal(2)),
      Instruction("mul", 'a', Ref('a')),
      Instruction("mod", 'a', Literal(5)),
      Instruction("snd", 'a', EmptyValue),
      Instruction("set", 'a', Literal(0)),
      Instruction("rcv", 'a', EmptyValue),
      Instruction("jgz", 'a', Literal(-1)),
      Instruction("set", 'a', Literal(1)),
      Instruction("jgz", 'a', Literal(-2))
    )
  }

  test("findRcv") {
    getRcv(Vector(
      Instruction("set", 'a', Literal(1)),
      Instruction("add", 'a', Literal(2)),
      Instruction("mul", 'a', Ref('a')),
      Instruction("mod", 'a', Literal(5)),
      Instruction("snd", 'a', EmptyValue),
      Instruction("set", 'a', Literal(0)),
      Instruction("rcv", 'a', EmptyValue),
      Instruction("jgz", 'a', Literal(-1)),
      Instruction("set", 'a', Literal(1)),
      Instruction("jgz", 'a', Literal(-2))
    )) shouldBe Some(4)
  }
}
// defined class Day18Part1Test

(new Day18Part1Test).execute()
// Day18Part1Test:
// - testInstFromLine
// - testParseLines
// - findRcv
```
{% endraw %}

That all seems to be working, I can now run the puzzle program and get the first `rcv`'d value.

{% raw %}
```scala
import scala.io.Source
// import scala.io.Source

val program = parseLines(Source.fromResource("day18input.txt").getLines())
// program: Vector[Instruction] = Vector(Instruction(set,i,Literal(31)), Instruction(set,a,Literal(1)), Instruction(mul,p,Literal(17)), Instruction(jgz,p,Ref(p)), Instruction(mul,a,Literal(2)), Instruction(add,i,Literal(-1)), Instruction(jgz,i,Literal(-2)), Instruction(add,a,Literal(-1)), Instruction(set,i,Literal(127)), Instruction(set,p,Literal(622)), Instruction(mul,p,Literal(8505)), Instruction(mod,p,Ref(a)), Instruction(mul,p,Literal(129749)), Instruction(add,p,Literal(12345)), Instruction(mod,p,Ref(a)), Instruction(set,b,Ref(p)), Instruction(mod,b,Literal(10000)), Instruction(snd,b,EmptyValue), Instruction(add,i,Literal(-1)), Instruction(jgz,i,Literal(-9)), Instruction(jgz,a,Literal(3)), Instruction(rcv,b,EmptyValue), Instruction(jgz,b,Literal(-1)), Instruction(set,f,Literal(0)), Ins...

getRcv(program)
// res1: Option[Long] = Some(9423)
```
{% endraw %}

## Part 2

For part two I need to implement some form of concurrency. I eventually opted for running each process in turn until a
`rcv` was encountered for which there was no input, storing a buffer of `snd` values as it ran. That buffer could then
be sent the other process which would run until it had exhausted it and so on.

If either terminated, the other was run until it was out of inputs. If a program sent nothing and the other was waiting
for input, both were also considered terminated.

When handing over control I was also needed to keep track of where the next value needed to be stored if it was sent.

{% raw %}
```scala
case class Prog(label: String,
                registers: Map[Char, Long],
                position: Int,
                sentCount: Int = 0,
                term: Boolean = false,
                target: Option[Char] = None)
// defined class Prog

def runConcurrent(program: Vector[Instruction]): Int  = {
  def runUntilRecv(prog: Prog, incoming: Seq[Long], outgoing: Seq[Long]): (Prog, Seq[Long]) =
    if (prog.term || !program.isDefinedAt(prog.position)) (prog.copy(term = true), outgoing)
    else program(prog.position) match {
      case Instruction("snd", r, _) =>
        runUntilRecv(
          prog.copy(
            position = prog.position + 1,
            sentCount = prog.sentCount + 1
          ),
          incoming,
          outgoing :+ prog.registers(r)
        )
      case Instruction("set", r, v) =>
        runUntilRecv(
          prog.copy(
            registers = prog.registers.updated(r, v.getValue(prog.registers)),
            position = prog.position + 1
          ),
          incoming,
          outgoing
        )
      case Instruction("add", r, v) =>
        runUntilRecv(
          prog.copy(
            registers = prog.registers.updated(r, prog.registers(r) + v.getValue(prog.registers)),
            position = prog.position + 1
          ),
          incoming,
          outgoing
        )
      case Instruction("mul", r, v) =>
        runUntilRecv(
          prog.copy(
            registers = prog.registers.updated(r, prog.registers(r) * v.getValue(prog.registers)),
            position = prog.position + 1
          ),
          incoming,
          outgoing
        )
      case Instruction("mod", r, v) =>
        runUntilRecv(
          prog.copy(
            registers = prog.registers.updated(r, prog.registers(r) % v.getValue(prog.registers)),
            position = prog.position + 1
          ),
          incoming,
          outgoing
        )
      case Instruction("jgz", r, v) if prog.registers(r) > 0 =>
        runUntilRecv(
          prog.copy(
            position = prog.position + v.getValue(prog.registers).toInt
          ),
          incoming,
          outgoing
        )
      case Instruction("jgz", _, _) =>
        runUntilRecv(
          prog.copy(
            position = prog.position + 1
          ),
          incoming,
          outgoing
        )
      case Instruction("jmp", _, i) =>
        runUntilRecv(
          prog.copy(
            position = prog.position + i.getValue(prog.registers).toInt
          ),
          incoming,
          outgoing
        )
      case Instruction("rcv", r, _) =>
        incoming match {
          case i +: is => runUntilRecv(
            prog.copy(
              registers = prog.registers.updated(r, i),
              position = prog.position + 1
            ),
            is,
            outgoing
          )
          case Nil => (prog.copy(target = Some(r), position = prog.position + 1), outgoing)
        }
    }

  def iter(p0: Prog, p1: Prog, incoming: Seq[Long]): (Prog, Prog) = {
    if (incoming == Nil && p0.target.isDefined) (p0, p1)
    else {
      val (newP0, outgoing) = incoming match {
        case i +: is if p0.target.isDefined => runUntilRecv(
          p0.copy(
            registers = p0.registers.updated(p0.target.get, i),
            target = None
          ),
          is,
          Nil
        )
        case is => runUntilRecv(p0, is, Nil)
      }

      iter(p1, newP0, outgoing)
    }
  }

  val (pa, pb) = iter(
    Prog("Prog 0", Map('p' -> 0l).withDefaultValue(0), 0),
    Prog("Prog 1", Map('p' -> 1l).withDefaultValue(0), 0),
    Nil
  )

  val p1 = if(pa.label == "Prog 1") pa else pb

  p1.sentCount
}
// runConcurrent: (program: Vector[Instruction])Int
```
{% endraw %}

This can be tested with a variant of the simple example given. This was changed because I wasn't setup to parse literals
in the first value position, but achieving the same effect.

{% raw %}
```scala
import org.scalatest.{FunSuite, Matchers}
// import org.scalatest.{FunSuite, Matchers}

class Day18Part2Test extends FunSuite with Matchers {
  test("run concurrent") {
    runConcurrent(Vector(
      Instruction("snd", 'p', EmptyValue),
      Instruction("snd", 'p', EmptyValue),
      Instruction("snd", 'p', EmptyValue),
      Instruction("rcv", 'a', EmptyValue),
      Instruction("rcv", 'b', EmptyValue),
      Instruction("rcv", 'c', EmptyValue),
      Instruction("rcv", 'd', EmptyValue)
    )) shouldBe 3
  }
}
// defined class Day18Part2Test

(new Day18Part2Test).execute()
// Day18Part2Test:
// - run concurrent
```
{% endraw %}

The program can then be run concurrently to find the second puzzle answer

{% raw %}
```scala
runConcurrent(program)
// res3: Int = 7620
```
{% endraw %}
