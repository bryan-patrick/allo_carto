import 'dart:math' as math;
import 'package:confetti/confetti.dart';
import 'package:flutter/material.dart';

class ConfettiSection extends StatelessWidget {
  const ConfettiSection({super.key, required this.confettiController});

  final ConfettiController confettiController;

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: IgnorePointer(
        child: Stack(
          children: [
            Align(
              alignment: Alignment.bottomCenter,
              child: ConfettiWidget(
                confettiController: confettiController,
                blastDirection: -math.pi / 2 + 0.16,
                blastDirectionality: BlastDirectionality.directional,
                emissionFrequency: 0.03,
                numberOfParticles: 5,
                shouldLoop: false,
                gravity: 0.20,
                maxBlastForce: 90,
                minBlastForce: 45,
              ),
            ),
            Align(
              alignment: Alignment.bottomCenter,
              child: ConfettiWidget(
                confettiController: confettiController,
                blastDirection: -math.pi / 2,
                blastDirectionality: BlastDirectionality.directional,
                emissionFrequency: 0.03,
                numberOfParticles: 6,
                shouldLoop: false,
                gravity: 0.20,
                maxBlastForce: 90,
                minBlastForce: 45,
              ),
            ),
            Align(
              alignment: Alignment.bottomCenter,
              child: ConfettiWidget(
                confettiController: confettiController,
                blastDirection: -math.pi / 2 - 0.16,
                blastDirectionality: BlastDirectionality.directional,
                emissionFrequency: 0.03,
                numberOfParticles: 5,
                shouldLoop: false,
                gravity: 0.20,
                maxBlastForce: 90,
                minBlastForce: 45,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
