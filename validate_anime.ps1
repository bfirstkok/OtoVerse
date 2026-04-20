$json = Get-Content "./public/animeData.json" -Raw | ConvertFrom-Json

echo "=== JSON VALIDATION REPORT ==="
echo "Total entries: $($json.Count)"
echo ""

# Initialize counters
$emptyTitles = @()
$emptyYoutubeIds = @()
$emptyAcceptedAnswers = @()
$emptyAcceptedArrays = @()
$totalIssues = 0

# Validate each entry
for ($i = 0; $i -lt $json.Count; $i++) {
    $entry = $json[$i]
    $entryId = if ($entry.id) { $entry.id } else { "Index_$i" }
    
    # Check title
    if ([string]::IsNullOrWhiteSpace($entry.title)) {
        $emptyTitles += $entryId
        $totalIssues++
    }
    
    # Check youtubeVideoId
    if ([string]::IsNullOrWhiteSpace($entry.youtubeVideoId)) {
        $emptyYoutubeIds += $entryId
        $totalIssues++
    }
    
    # Check acceptedAnswers
    if ($null -eq $entry.acceptedAnswers) {
        $emptyAcceptedAnswers += $entryId
        $totalIssues++
    }
    
    if ($entry.acceptedAnswers -is [System.Collections.IList] -and $entry.acceptedAnswers.Count -eq 0) {
        $emptyAcceptedArrays += $entryId
        $totalIssues++
    }
}

echo "1. EMPTY/WHITESPACE TITLES: $($emptyTitles.Count)"
if ($emptyTitles.Count -gt 0) {
    foreach ($id in $emptyTitles) {
        echo "   - $id"
    }
}
echo ""

echo "2. EMPTY/WHITESPACE YOUTUBE VIDEO IDs: $($emptyYoutubeIds.Count)"
if ($emptyYoutubeIds.Count -gt 0) {
    foreach ($id in $emptyYoutubeIds) {
        echo "   - $id"
    }
}
echo ""

echo "3. NULL/UNDEFINED ACCEPTED ANSWERS: $($emptyAcceptedAnswers.Count)"
if ($emptyAcceptedAnswers.Count -gt 0) {
    foreach ($id in $emptyAcceptedAnswers) {
        echo "   - $id"
    }
}
echo ""

echo "4. EMPTY ACCEPTED ANSWERS ARRAYS: $($emptyAcceptedArrays.Count)"
if ($emptyAcceptedArrays.Count -gt 0) {
    foreach ($id in $emptyAcceptedArrays) {
        echo "   - $id"
    }
}
echo ""

echo "TOTAL ISSUES FOUND: $totalIssues out of $($json.Count * 3) field checks"
