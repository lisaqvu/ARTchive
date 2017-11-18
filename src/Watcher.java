import java.io.File;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.nio.file.StandardWatchEventKinds;
import java.nio.file.WatchEvent;
import java.nio.file.WatchKey;
import java.nio.file.WatchService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

// Code copied https://stackoverflow.com/posts/27737069/revisions

public class Watcher extends Thread {
  private final File file;
  private AtomicBoolean stop = new AtomicBoolean(false);

  public Watcher(File file) {
    this.file = file;
  }

  private boolean isStopped() {
    return stop.get();
  }

  private void doOnChange() {
    TakeScreenshot.run();
  }

  @Override
  public void run() {
    try (WatchService watcher = FileSystems.getDefault().newWatchService()) {
      Path path = file.toPath().getParent();
      path.register(watcher, StandardWatchEventKinds.ENTRY_MODIFY);
      while (!isStopped()) {
        WatchKey key;
        try {
          key = watcher.poll(25, TimeUnit.MILLISECONDS);
        } catch (InterruptedException e) {
          return;
        }
        if (key == null) {
          Thread.yield();
          continue;
        }

        for (WatchEvent<?> event : key.pollEvents()) {
          WatchEvent.Kind<?> kind = event.kind();

          @SuppressWarnings("unchecked")
          WatchEvent<Path> ev = (WatchEvent<Path>) event;
          Path filename = ev.context();

          if (kind == StandardWatchEventKinds.OVERFLOW) {
            Thread.yield();
            continue;
          } else if (kind == java.nio.file.StandardWatchEventKinds.ENTRY_MODIFY
              && filename.toString().equals(file.getName())) {
            doOnChange();
          }
          boolean valid = key.reset();
          if (!valid) {
            break;
          }
        }
        Thread.yield();
      }
    } catch (Throwable e) {
      System.out.println("Error");
    }
  }
}
