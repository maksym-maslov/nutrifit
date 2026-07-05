package ai.nutrifit.main_api.controller;

import ai.nutrifit.main_api.dto.DailySummaryResponse;
import ai.nutrifit.main_api.service.DailySummaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/daily-summary")
public class DailySummaryController {
    private final DailySummaryService dailySummaryService;

    public DailySummaryController(DailySummaryService dailySummaryService) {
        this.dailySummaryService = dailySummaryService;
    }

    @GetMapping
    public ResponseEntity<DailySummaryResponse> getDailySummary(@RequestParam LocalDate date) {
        DailySummaryResponse response = dailySummaryService.getDailySummary(date);
        return ResponseEntity.ok(response);
    }
}
