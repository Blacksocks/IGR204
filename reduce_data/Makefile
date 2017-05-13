EXE      = main
FILE_IN  = "../data/homicides.csv"
FILE_OUT = "../data/homicides_small.csv"
RATIO    = "0.01"

.PHONY: run

all: run clean

run: $(EXE)
	./$< $(FILE_IN) $(FILE_OUT) $(RATIO)

clean:
	rm -f $(EXE)
